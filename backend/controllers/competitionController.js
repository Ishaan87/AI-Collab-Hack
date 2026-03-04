import pool from '../config/db.js';

// ─── GET ALL COMPETITIONS (with filters + search + pagination) ────────────────
export const getCompetitions = async (req, res) => {
  try {
    const { status, type, search, online, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status)  { params.push(status);          conditions.push(`c.status = $${params.length}`); }
    if (type)    { params.push(type);             conditions.push(`c.type = $${params.length}`); }
    if (online !== undefined) { params.push(online === 'true'); conditions.push(`c.is_online = $${params.length}`); }
    if (search)  {
      params.push(`%${search}%`);
      conditions.push(`(c.title ILIKE $${params.length} OR c.organizer ILIKE $${params.length} OR $${params.length} ILIKE ANY(SELECT '%' || t || '%' FROM unnest(c.tags) t))`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(Number(limit), Number(offset));

    const data = await pool.query(
      `SELECT c.id, c.title, c.type, c.organizer, c.organizer_logo_url, c.banner_url,
              c.prize_pool, c.max_team_size, c.min_team_size,
              c.registration_deadline, c.start_date, c.end_date,
              c.location, c.is_online, c.status, c.tags,
              COUNT(cr.id)::int AS registered_count
       FROM competitions c
       LEFT JOIN competition_registrations cr ON cr.competition_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.registration_deadline ASC NULLS LAST
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM competitions c ${where}`,
      params.slice(0, -2)
    );

    res.json({
      success: true,
      competitions: data.rows,
      pagination: {
        total: parseInt(total.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total.rows[0].count / limit),
      },
    });
  } catch (err) {
    console.error('getCompetitions error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET SINGLE COMPETITION ───────────────────────────────────────────────────
export const getCompetition = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, COUNT(cr.id)::int AS registered_count
       FROM competitions c
       LEFT JOIN competition_registrations cr ON cr.competition_id = c.id
       WHERE c.id = $1 GROUP BY c.id`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Competition not found.' });

    const comp = result.rows[0];

    if (comp.required_skills?.length) {
      const skillDetails = await pool.query(
        'SELECT id, name, category FROM skills WHERE id = ANY($1)',
        [comp.required_skills]
      );
      comp.required_skills_details = skillDetails.rows;
    }

    res.json({ success: true, competition: comp });
  } catch (err) {
    console.error('getCompetition error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── CREATE COMPETITION ───────────────────────────────────────────────────────
export const createCompetition = async (req, res) => {
  try {
    const {
      title, description, type, organizer, organizer_logo_url, banner_url,
      prize_pool, max_team_size, min_team_size, registration_deadline,
      start_date, end_date, location, is_online, registration_url, tags, required_skills,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO competitions
        (title,description,type,organizer,organizer_logo_url,banner_url,
         prize_pool,max_team_size,min_team_size,registration_deadline,
         start_date,end_date,location,is_online,registration_url,
         tags,required_skills,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [
        title, description, type, organizer,
        organizer_logo_url || null, banner_url || null, prize_pool,
        max_team_size || 4, min_team_size || 1,
        registration_deadline, start_date, end_date,
        location, is_online !== false, registration_url || null,
        tags || [], required_skills || [], req.user.id,
      ]
    );

    res.status(201).json({ success: true, competition: result.rows[0] });
  } catch (err) {
    console.error('createCompetition error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── REGISTER FOR COMPETITION ─────────────────────────────────────────────────
export const registerForCompetition = async (req, res) => {
  try {
    const { id } = req.params;

    const comp = await pool.query(
      'SELECT status, registration_deadline FROM competitions WHERE id = $1',
      [id]
    );
    if (!comp.rows.length)
      return res.status(404).json({ success: false, message: 'Competition not found.' });

    const { status, registration_deadline } = comp.rows[0];
    if (['completed', 'cancelled'].includes(status))
      return res.status(400).json({ success: false, message: 'Competition is closed.' });
    if (registration_deadline && new Date(registration_deadline) < new Date())
      return res.status(400).json({ success: false, message: 'Registration deadline passed.' });

    await pool.query(
      'INSERT INTO competition_registrations (competition_id, user_id) VALUES ($1, $2)',
      [id, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Registered successfully.' });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ success: false, message: 'Already registered.' });
    console.error('registerForCompetition error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── WITHDRAW FROM COMPETITION ────────────────────────────────────────────────
export const withdrawFromCompetition = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE competition_registrations
       SET registration_status = 'withdrawn'
       WHERE competition_id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, message: 'Withdrawn from competition.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── MY COMPETITIONS ──────────────────────────────────────────────────────────
export const getMyCompetitions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.title, c.type, c.organizer, c.prize_pool, c.banner_url,
              c.start_date, c.end_date, c.status, c.is_online, c.location,
              cr.registration_status, cr.registered_at, cr.team_id
       FROM competition_registrations cr
       JOIN competitions c ON c.id = cr.competition_id
       WHERE cr.user_id = $1
       ORDER BY c.start_date DESC`,
      [req.user.id]
    );
    res.json({ success: true, competitions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
