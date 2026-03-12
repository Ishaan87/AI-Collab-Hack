import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'kinetic',
  user: 'postgres',
  password: 'root',
});

// ─── Helper: create notification ─────────────────────────────────────────────
const createNotification = async (userId, type, title, body, relatedId) => {
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, type, title, body, relatedId || null]
  );
};

async function acceptAllMockInvites() {
  const client = await pool.connect();
  try {
    console.log('Finding pending invites...');
    
    const invitesRes = await client.query(
      `SELECT ti.*, c.title AS comp_title, c.max_team_size,
              u.full_name AS sender_name, u.username AS sender_username,
              r.full_name AS receiver_name, r.username AS receiver_username
       FROM team_invites ti
       JOIN competitions c ON c.id = ti.competition_id
       JOIN users u ON u.id = ti.sender_id
       JOIN users r ON r.id = ti.receiver_id
       WHERE ti.status = 'pending'`
    );

    const invites = invitesRes.rows;
    console.log(`Found ${invites.length} pending invites.`);

    for (const inv of invites) {
      console.log(`Processing invite from ${inv.sender_username} to ${inv.receiver_username} for comp ${inv.comp_title}...`);
      await client.query('BEGIN');

      let teamId = inv.team_id;
      if (!teamId) {
        // Check if sender has team
        const existingTeam = await client.query(
          `SELECT t.id FROM teams t
           JOIN team_members tm ON tm.team_id = t.id
           WHERE t.competition_id = $1 AND tm.user_id = $2`,
          [inv.competition_id, inv.sender_id]
        );

        if (existingTeam.rows.length) {
          teamId = existingTeam.rows[0].id;
        } else {
          // Create team
          const newTeam = await client.query(
            `INSERT INTO teams (competition_id, name, created_by)
             VALUES ($1, $2, $3) RETURNING id`,
            [inv.competition_id, `Team ${(inv.sender_name || 'Unknown').split(' ')[0]}`, inv.sender_id]
          );
          teamId = newTeam.rows[0].id;

          // Add sender as leader
          await client.query(
            `INSERT INTO team_members (team_id, user_id, role)
             VALUES ($1, $2, 'leader')
             ON CONFLICT (team_id, user_id) DO NOTHING`,
            [teamId, inv.sender_id]
          );

          // Register sender for competition
          await client.query(
            `INSERT INTO competition_registrations (competition_id, user_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [inv.competition_id, inv.sender_id]
          );
        }
      }

      // Check team capacity
      const memberCount = await client.query('SELECT COUNT(*) FROM team_members WHERE team_id = $1', [teamId]);
      if (parseInt(memberCount.rows[0].count) >= inv.max_team_size) {
        console.log(`Team full, skipping.`);
        await client.query('ROLLBACK');
        continue;
      }

      // Add receiver to team
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, 'member')
         ON CONFLICT (team_id, user_id) DO NOTHING`,
        [teamId, inv.receiver_id]
      );

      // Register receiver for competition
      await client.query(
        `INSERT INTO competition_registrations (competition_id, user_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [inv.competition_id, inv.receiver_id]
      );

      // Update invite status + set team_id
      await client.query(
        `UPDATE team_invites SET status = 'accepted', team_id = $1 WHERE id = $2`,
        [teamId, inv.id]
      );

      // Expire other pending invites
      await client.query(
        `UPDATE team_invites SET status = 'expired'
         WHERE receiver_id = $1 AND competition_id = $2
           AND id != $3 AND status = 'pending'`,
        [inv.receiver_id, inv.competition_id, inv.id]
      );

      await client.query('COMMIT');

      // Notify sender
      await createNotification(
        inv.sender_id,
        'invite_accepted',
        `${inv.receiver_name} accepted your invite! 🎉`,
        `Your team for "${inv.comp_title}" is taking shape. Check My Teams.`,
        teamId
      );

      console.log(`Successfully accepted invite! Team ID: ${teamId}`);
    }

    console.log('Done processing invites.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error accepting invites:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

acceptAllMockInvites();
