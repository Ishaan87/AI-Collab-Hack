import pool from '../config/db.js';

// ─── Helper: create notification ─────────────────────────────────────────────
const createNotification = async (userId, type, title, body, relatedId) => {
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, type, title, body, relatedId || null]
  );
};

// ─── SEND INVITE ──────────────────────────────────────────────────────────────
export const sendInvite = async (req, res) => {
  try {
    const { competition_id, receiver_id, message } = req.body;

    if (receiver_id === req.user.id)
      return res.status(400).json({ success: false, message: "You can't invite yourself." });

    // Check competition exists
    const comp = await pool.query('SELECT id, title FROM competitions WHERE id = $1', [competition_id]);
    if (!comp.rows.length)
      return res.status(404).json({ success: false, message: 'Competition not found.' });

    // Check receiver exists and has completed assessment
    const receiver = await pool.query(
      'SELECT id, username, full_name, is_assessment_done FROM users WHERE id = $1',
      [receiver_id]
    );
    if (!receiver.rows.length)
      return res.status(404).json({ success: false, message: 'User not found.' });

    // Insert invite (ON CONFLICT handles duplicate gracefully)
    const invite = await pool.query(
      `INSERT INTO team_invites (competition_id, sender_id, receiver_id, message)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (competition_id, sender_id, receiver_id)
       DO UPDATE SET status = 'pending', expires_at = NOW() + INTERVAL '48 hours', created_at = NOW()
       RETURNING *`,
      [competition_id, req.user.id, receiver_id, message || null]
    );

    // Notify receiver
    const senderName = req.user.full_name || req.user.username;
    await createNotification(
      receiver_id,
      'team_invite',
      `${senderName} wants to team up!`,
      `You've been invited to join a team for "${comp.rows[0].title}"`,
      invite.rows[0].id
    );

    res.status(201).json({ success: true, invite: invite.rows[0] });
  } catch (err) {
    console.error('sendInvite error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET MY INVITES (received) ────────────────────────────────────────────────
export const getMyInvites = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        ti.*,
        c.title AS competition_title, c.type AS competition_type,
        c.start_date, c.end_date, c.banner_url,
        u.username AS sender_username, u.full_name AS sender_name,
        u.avatar_url AS sender_avatar,
        r.tier AS sender_tier, r.elo_score AS sender_elo
       FROM team_invites ti
       JOIN competitions c ON c.id = ti.competition_id
       JOIN users u ON u.id = ti.sender_id
       LEFT JOIN user_ratings r ON r.user_id = ti.sender_id
       WHERE ti.receiver_id = $1
         AND ti.status = 'pending'
         AND ti.expires_at > NOW()
       ORDER BY ti.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, invites: result.rows });
  } catch (err) {
    console.error('getMyInvites error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── ACCEPT INVITE ────────────────────────────────────────────────────────────
export const acceptInvite = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const invite = await client.query(
      `SELECT ti.*, c.title AS comp_title, c.max_team_size,
              u.full_name AS sender_name
       FROM team_invites ti
       JOIN competitions c ON c.id = ti.competition_id
       JOIN users u ON u.id = ti.sender_id
       WHERE ti.id = $1 AND ti.receiver_id = $2 AND ti.status = 'pending'`,
      [req.params.id, req.user.id]
    );

    if (!invite.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Invite not found or already handled.' });
    }

    const inv = invite.rows[0];

    // Check if sender already has a team for this competition
    let teamId = inv.team_id;
    if (!teamId) {
      // Check if sender is already in a team for this comp
      const existingTeam = await client.query(
        `SELECT t.id FROM teams t
         JOIN team_members tm ON tm.team_id = t.id
         WHERE t.competition_id = $1 AND tm.user_id = $2`,
        [inv.competition_id, inv.sender_id]
      );

      if (existingTeam.rows.length) {
        teamId = existingTeam.rows[0].id;
      } else {
        // Create new team
        const newTeam = await client.query(
          `INSERT INTO teams (competition_id, name, created_by)
           VALUES ($1, $2, $3) RETURNING id`,
          [
            inv.competition_id,
            `Team ${(inv.sender_name || 'Unknown').split(' ')[0]}`,
            inv.sender_id,
          ]
        );
        teamId = newTeam.rows[0].id;

        // Add sender as leader
        await client.query(
          `INSERT INTO team_members (team_id, user_id, role)
           VALUES ($1, $2, 'leader')
           ON CONFLICT (team_id, user_id) DO NOTHING`,
          [teamId, inv.sender_id]
        );

        // Register sender for competition if not already
        await client.query(
          `INSERT INTO competition_registrations (competition_id, user_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [inv.competition_id, inv.sender_id]
        );
      }
    }

    // Check team capacity
    const memberCount = await client.query(
      'SELECT COUNT(*) FROM team_members WHERE team_id = $1',
      [teamId]
    );
    if (parseInt(memberCount.rows[0].count) >= inv.max_team_size) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Team is already full.' });
    }

    // Add receiver to team
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (team_id, user_id) DO NOTHING`,
      [teamId, req.user.id]
    );

    // Register receiver for competition
    await client.query(
      `INSERT INTO competition_registrations (competition_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [inv.competition_id, req.user.id]
    );

    // Update invite status + set team_id
    await client.query(
      `UPDATE team_invites SET status = 'accepted', team_id = $1 WHERE id = $2`,
      [teamId, inv.id]
    );

    // Expire all other pending invites for this receiver in this competition
    await client.query(
      `UPDATE team_invites SET status = 'expired'
       WHERE receiver_id = $1 AND competition_id = $2
         AND id != $3 AND status = 'pending'`,
      [req.user.id, inv.competition_id, inv.id]
    );

    await client.query('COMMIT');

    // Notify sender
    const receiverName = req.user.full_name || req.user.username;
    await createNotification(
      inv.sender_id,
      'invite_accepted',
      `${receiverName} accepted your invite! 🎉`,
      `Your team for "${inv.comp_title}" is taking shape. Check My Teams.`,
      teamId
    );

    res.json({ success: true, message: 'Invite accepted! You\'ve joined the team.', team_id: teamId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('acceptInvite error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    client.release();
  }
};

// ─── DECLINE INVITE ───────────────────────────────────────────────────────────
export const declineInvite = async (req, res) => {
  try {
    const invite = await pool.query(
      `SELECT ti.*, c.title AS comp_title, u.full_name AS sender_name
       FROM team_invites ti
       JOIN competitions c ON c.id = ti.competition_id
       JOIN users u ON u.id = ti.sender_id
       WHERE ti.id = $1 AND ti.receiver_id = $2 AND ti.status = 'pending'`,
      [req.params.id, req.user.id]
    );

    if (!invite.rows.length)
      return res.status(404).json({ success: false, message: 'Invite not found.' });

    const inv = invite.rows[0];

    await pool.query(
      `UPDATE team_invites SET status = 'declined' WHERE id = $1`,
      [inv.id]
    );

    // Notify sender
    const receiverName = req.user.full_name || req.user.username;
    await createNotification(
      inv.sender_id,
      'invite_declined',
      `${receiverName} declined your invite`,
      `They couldn't join your team for "${inv.comp_title}" this time.`,
      inv.id
    );

    res.json({ success: true, message: 'Invite declined.' });
  } catch (err) {
    console.error('declineInvite error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
