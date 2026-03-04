import pool from '../config/db.js';
import { randomBytes } from 'crypto';

const generateInviteCode = () => randomBytes(5).toString('hex').toUpperCase(); // e.g. A3F9B2C1D4

// ─── GET MY TEAMS ─────────────────────────────────────────────────────────────
export const getMyTeams = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        t.id, t.name, t.description, t.is_open, t.invite_code,
        t.last_active_at, t.created_at,
        tm.role AS my_role,
        c.id AS competition_id, c.title AS competition_title, c.status AS competition_status,
        COUNT(tm2.id)::int AS member_count,
        t.max_members
       FROM team_members tm
       JOIN teams t ON t.id = tm.team_id
       JOIN competitions c ON c.id = t.competition_id
       LEFT JOIN team_members tm2 ON tm2.team_id = t.id
       WHERE tm.user_id = $1
       GROUP BY t.id, tm.role, c.id
       ORDER BY t.last_active_at DESC`,
      [req.user.id]
    );

    // For each team, fetch member previews
    const teams = await Promise.all(
      result.rows.map(async (team) => {
        const members = await pool.query(
          `SELECT u.id, u.username, u.full_name, u.avatar_url, tm.role
           FROM team_members tm
           JOIN users u ON u.id = tm.user_id
           WHERE tm.team_id = $1`,
          [team.id]
        );
        return { ...team, members: members.rows };
      })
    );

    res.json({ success: true, teams });
  } catch (err) {
    console.error('getMyTeams error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET SINGLE TEAM ──────────────────────────────────────────────────────────
export const getTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const teamResult = await pool.query(
      `SELECT t.*, c.title AS competition_title, c.type AS competition_type,
              c.status AS competition_status, c.max_team_size AS comp_max_size
       FROM teams t JOIN competitions c ON c.id = t.competition_id
       WHERE t.id = $1`,
      [id]
    );

    if (!teamResult.rows.length)
      return res.status(404).json({ success: false, message: 'Team not found.' });

    const team = teamResult.rows[0];

    const members = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url, u.headline,
              tm.role, tm.joined_at,
              r.elo_score, r.tier
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       LEFT JOIN user_ratings r ON r.user_id = u.id
       WHERE tm.team_id = $1`,
      [id]
    );

    res.json({ success: true, team: { ...team, members: members.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── CREATE TEAM ──────────────────────────────────────────────────────────────
export const createTeam = async (req, res) => {
  try {
    const { competition_id, name, description, max_members } = req.body;

    // Check competition exists
    const comp = await pool.query('SELECT id, max_team_size FROM competitions WHERE id = $1', [competition_id]);
    if (!comp.rows.length)
      return res.status(404).json({ success: false, message: 'Competition not found.' });

    // Check user is registered for competition
    const reg = await pool.query(
      "SELECT id FROM competition_registrations WHERE competition_id = $1 AND user_id = $2 AND registration_status != 'withdrawn'",
      [competition_id, req.user.id]
    );
    if (!reg.rows.length)
      return res.status(403).json({ success: false, message: 'You must register for the competition first.' });

    const inviteCode = generateInviteCode();
    const effectiveMax = max_members || comp.rows[0].max_team_size;

    const teamResult = await pool.query(
      `INSERT INTO teams (competition_id, name, description, created_by, max_members, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [competition_id, name, description || null, req.user.id, effectiveMax, inviteCode]
    );

    const team = teamResult.rows[0];

    // Add creator as leader
    await pool.query(
      "INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'leader')",
      [team.id, req.user.id]
    );

    // Update registration status
    await pool.query(
      "UPDATE competition_registrations SET team_id = $1, registration_status = 'in_team' WHERE competition_id = $2 AND user_id = $3",
      [team.id, competition_id, req.user.id]
    );

    res.status(201).json({ success: true, team });
  } catch (err) {
    console.error('createTeam error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── JOIN TEAM BY INVITE CODE ─────────────────────────────────────────────────
export const joinTeam = async (req, res) => {
  try {
    const { invite_code } = req.body;

    const teamResult = await pool.query(
      'SELECT * FROM teams WHERE invite_code = $1',
      [invite_code.toUpperCase()]
    );
    if (!teamResult.rows.length)
      return res.status(404).json({ success: false, message: 'Invalid invite code.' });

    const team = teamResult.rows[0];

    if (!team.is_open)
      return res.status(403).json({ success: false, message: 'Team is not accepting members.' });

    // Check team capacity
    const memberCount = await pool.query(
      'SELECT COUNT(*) FROM team_members WHERE team_id = $1',
      [team.id]
    );
    if (parseInt(memberCount.rows[0].count) >= team.max_members)
      return res.status(400).json({ success: false, message: 'Team is full.' });

    // Check user is registered for the competition
    const reg = await pool.query(
      "SELECT id FROM competition_registrations WHERE competition_id = $1 AND user_id = $2 AND registration_status != 'withdrawn'",
      [team.competition_id, req.user.id]
    );
    if (!reg.rows.length)
      return res.status(403).json({ success: false, message: 'Register for the competition first.' });

    await pool.query(
      "INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')",
      [team.id, req.user.id]
    );

    await pool.query(
      "UPDATE competition_registrations SET team_id = $1, registration_status = 'in_team' WHERE competition_id = $2 AND user_id = $3",
      [team.id, team.competition_id, req.user.id]
    );

    // Update last active
    await pool.query('UPDATE teams SET last_active_at = NOW() WHERE id = $1', [team.id]);

    res.json({ success: true, message: 'Joined team successfully.', team_id: team.id });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ success: false, message: 'Already in this team.' });
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── LEAVE TEAM ───────────────────────────────────────────────────────────────
export const leaveTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    if (!team.rows.length)
      return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.rows[0].created_by === req.user.id)
      return res.status(400).json({ success: false, message: 'Team leader cannot leave. Transfer leadership or disband the team.' });

    await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    await pool.query(
      "UPDATE competition_registrations SET team_id = NULL, registration_status = 'registered' WHERE team_id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    res.json({ success: true, message: 'Left team.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── UPDATE TEAM (leader only) ────────────────────────────────────────────────
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_open } = req.body;

    const team = await pool.query('SELECT created_by FROM teams WHERE id = $1', [id]);
    if (!team.rows.length)
      return res.status(404).json({ success: false, message: 'Team not found.' });
    if (team.rows[0].created_by !== req.user.id)
      return res.status(403).json({ success: false, message: 'Only the team leader can edit.' });

    const result = await pool.query(
      `UPDATE teams SET
        name        = COALESCE($1, name),
        description = COALESCE($2, description),
        is_open     = COALESCE($3, is_open),
        updated_at  = NOW()
       WHERE id = $4 RETURNING *`,
      [name, description, is_open, id]
    );

    res.json({ success: true, team: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
