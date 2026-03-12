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
      title, description, type, banner_url, prize_pool,
      max_team_size, min_team_size,
      registration_deadline, start_date, end_date,
      location, is_online, website_url, tags, status,
    } = req.body;

    // Fetch organizer name from DB since JWT only carries id/email/username
    const organizer = await pool.query(
      'SELECT full_name, username FROM users WHERE id = $1',
      [req.user.id]
    );
    const organizerName = organizer.rows[0]?.full_name || organizer.rows[0]?.username || req.user.username;

    const result = await pool.query(
      `INSERT INTO competitions
        (title, description, type, status,
         organizer_id, organizer,
         banner_url, prize_pool,
         max_team_size, min_team_size,
         registration_deadline, start_date, end_date,
         location, is_online, registration_url,
         tags, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [
        title, description, type, status || 'upcoming',
        req.user.id, organizerName,
        banner_url || null, prize_pool || null,
        max_team_size || 4, min_team_size || 2,
        registration_deadline || null, start_date || null, end_date || null,
        location || null, is_online !== false,
        website_url || null,   // stored in registration_url (closest existing column)
        tags || [], req.user.id,
      ]
    );

    res.status(201).json({ success: true, competition: result.rows[0] });
  } catch (err) {
    console.error('createCompetition error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── REGISTER FOR COMPETITION (with form data) ───────────────────────────────
export const registerForCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name, email, mobile, college, year_of_study,
      skills_summary, why_join, experience,
      github_url, linkedin_url, portfolio_url,
      custom_answers,
    } = req.body;

    const comp = await pool.query(
      'SELECT status, registration_deadline, title FROM competitions WHERE id = $1',
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
      `INSERT INTO competition_registrations
        (competition_id, user_id, full_name, email, mobile, college, year_of_study,
         skills_summary, why_join, experience, github_url, linkedin_url, portfolio_url, custom_answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        id, req.user.id,
        full_name || null, email || null, mobile || null,
        college || null, year_of_study || null,
        skills_summary || null, why_join || null, experience || null,
        github_url || null, linkedin_url || null, portfolio_url || null,
        JSON.stringify(custom_answers || {}),
      ]
    );

    res.status(201).json({ success: true, message: 'Registered successfully.' });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ success: false, message: 'Already registered.' });
    console.error('registerForCompetition error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET MY HOSTED EVENTS ─────────────────────────────────────────────────────
export const getMyHostedEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
         COUNT(cr.id)::int AS participant_count
       FROM competitions c
       LEFT JOIN competition_registrations cr
         ON cr.competition_id = c.id AND cr.registration_status != 'withdrawn'
       WHERE c.organizer_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, competitions: result.rows });
  } catch (err) {
    console.error('getMyHostedEvents error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET REGISTRANTS FOR A HOSTED EVENT ──────────────────────────────────────
export const getEventRegistrants = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify requester is the organizer
    const comp = await pool.query(
      'SELECT id, title, organizer_id FROM competitions WHERE id = $1',
      [id]
    );
    if (!comp.rows.length)
      return res.status(404).json({ success: false, message: 'Competition not found.' });
    if (comp.rows[0].organizer_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized.' });

    const registrants = await pool.query(
      `SELECT
         cr.id AS registration_id,
         cr.registered_at, cr.registration_status,
         cr.full_name, cr.email, cr.mobile, cr.college,
         cr.year_of_study, cr.skills_summary, cr.why_join,
         cr.experience, cr.github_url, cr.linkedin_url,
         cr.portfolio_url, cr.custom_answers,
         u.id AS user_id, u.username, u.avatar_url,
         u.city, u.headline,
         r.elo_score, r.tier,
         t.name AS team_name
       FROM competition_registrations cr
       JOIN users u ON u.id = cr.user_id
       LEFT JOIN user_ratings r ON r.user_id = u.id
       LEFT JOIN teams t ON t.id = cr.team_id
       WHERE cr.competition_id = $1
         AND cr.registration_status != 'withdrawn'
       ORDER BY cr.registered_at DESC`,
      [id]
    );

    res.json({
      success:     true,
      competition: comp.rows[0],
      registrants: registrants.rows,
      total:       registrants.rows.length,
    });
  } catch (err) {
    console.error('getEventRegistrants error:', err);
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

// ─── GET WORKFLOW (AI generated, cached) ─────────────────────────────────────
export const getWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    const comp = await pool.query('SELECT * FROM competitions WHERE id = $1', [id]);
    if (!comp.rows.length)
      return res.status(404).json({ success: false, message: 'Competition not found.' });

    const competition = comp.rows[0];

    // Return cached if exists
    if (competition.ai_workflow) {
      return res.json({
        success:      true,
        workflow:     competition.ai_workflow,
        roles_needed: competition.ai_roles_needed,
        cached:       true,
      });
    }

    // Generate fresh
    const { generateCompetitionAI } = await import('../utils/collabMistralService.js');
    let aiResult;
    try {
      aiResult = await generateCompetitionAI(competition);
    } catch (aiErr) {
      console.error('AI workflow generation failed:', aiErr);
      return res.status(500).json({ success: false, message: 'AI generation failed. Try again.' });
    }

    // Cache in DB
    await pool.query(
      `UPDATE competitions SET
        ai_workflow = $1, ai_roles_needed = $2, ai_generated_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(aiResult.workflow), JSON.stringify(aiResult), id]
    );

    res.json({
      success:      true,
      workflow:     aiResult.workflow,
      roles_needed: aiResult,
      cached:       false,
    });
  } catch (err) {
    console.error('getWorkflow error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET COLLAB SUGGESTIONS (AI team matching) ────────────────────────────────
export const getCollabSuggestions = async (req, res) => {
  try {
    const { id } = req.params;

    const compResult = await pool.query('SELECT * FROM competitions WHERE id = $1', [id]);
    if (!compResult.rows.length)
      return res.status(404).json({ success: false, message: 'Competition not found.' });
    const competition = compResult.rows[0];

    // Get current user's full profile
    const userResult = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.city,
              r.elo_score, r.tier,
              p.preferred_role, p.hours_per_week
       FROM users u
       LEFT JOIN user_ratings r ON r.user_id = u.id
       LEFT JOIN user_preferences p ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    const currentUser = userResult.rows[0];

    const userSkills = await pool.query(
      'SELECT name, category, proficiency_level FROM user_skills WHERE user_id = $1',
      [req.user.id]
    );
    currentUser.skills = userSkills.rows;

    const userElo = currentUser.elo_score || 1000;

    // Get or generate roles needed
    let rolesNeeded = competition.ai_roles_needed;
    if (!rolesNeeded) {
      try {
        const { generateCompetitionAI } = await import('../utils/collabMistralService.js');
        const aiResult = await generateCompetitionAI(competition);
        rolesNeeded = aiResult;
        await pool.query(
          `UPDATE competitions SET ai_workflow = $1, ai_roles_needed = $2, ai_generated_at = NOW() WHERE id = $3`,
          [JSON.stringify(aiResult.workflow), JSON.stringify(aiResult), id]
        );
      } catch (e) {
        rolesNeeded = { roles_needed: [], ideal_team_size: 4 };
      }
    }

    const neededCategories = (rolesNeeded?.roles_needed || []).map(r => r.domain);

    // Fetch candidates with similar ELO
    // Wrap in subquery so ORDER BY can use the computed elo_diff without conflicting with DISTINCT
    const candidates = await pool.query(
      `SELECT id, username, full_name, avatar_url, city,
              elo_score, tier, preferred_role, hours_per_week
       FROM (
         SELECT DISTINCT ON (u.id)
           u.id, u.username, u.full_name, u.avatar_url, u.city,
           r.elo_score, r.tier,
           p.preferred_role, p.hours_per_week,
           ABS(r.elo_score - $6) AS elo_diff
         FROM users u
         JOIN user_ratings r ON r.user_id = u.id
         LEFT JOIN user_preferences p ON p.user_id = u.id
         JOIN user_skills us ON us.user_id = u.id
         WHERE r.elo_score BETWEEN $1 AND $2
           AND u.id != $3
           AND u.is_assessment_done = true
           AND u.is_active = true
           AND ($4::text[] = '{}' OR us.category = ANY($4::text[]))
           AND u.id NOT IN (
             SELECT tm.user_id FROM team_members tm
             JOIN teams t ON t.id = tm.team_id
             WHERE t.competition_id = $5
           )
       ) sub
       ORDER BY elo_diff
       LIMIT 60`,
      [
        Math.max(0, userElo - 400), userElo + 400,
        req.user.id,
        neededCategories.length ? neededCategories : '{}',
        id, userElo,
      ]
    );

    if (candidates.rows.length < 2) {
      return res.json({
        success:     true,
        suggestions: [],
        message:     'Not enough rated users available yet. Check back as more users join!',
      });
    }

    // Attach skills to each candidate
    const candidateIds = candidates.rows.map(c => c.id);
    const skillsResult = await pool.query(
      'SELECT user_id, name, category, proficiency_level FROM user_skills WHERE user_id = ANY($1)',
      [candidateIds]
    );
    const skillsByUser = skillsResult.rows.reduce((acc, s) => {
      if (!acc[s.user_id]) acc[s.user_id] = [];
      acc[s.user_id].push(s);
      return acc;
    }, {});
    const enrichedCandidates = candidates.rows.map(c => ({ ...c, skills: skillsByUser[c.id] || [] }));

    // Call Mistral
    const { generateTeamSuggestions } = await import('../utils/collabMistralService.js');
    let suggestions;
    try {
      const aiResult = await generateTeamSuggestions(competition, currentUser, enrichedCandidates, rolesNeeded);
      suggestions = aiResult.suggestions || [];
    } catch (aiErr) {
      console.error('Team suggestion AI failed:', aiErr);
      return res.status(500).json({ success: false, message: 'AI suggestion failed. Try again.' });
    }

    // Enrich suggestions with full user objects
    const enriched = suggestions.map(s => ({
      ...s,
      members: s.members.map(m => ({ ...m, ...enrichedCandidates.find(c => c.id === m.user_id) })),
    }));

    res.json({ success: true, suggestions: enriched, roles_needed: rolesNeeded });
  } catch (err) {
    console.error('getCollabSuggestions error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};