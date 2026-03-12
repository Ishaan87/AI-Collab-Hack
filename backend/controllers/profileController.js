import pool from '../config/db.js';

// ─── GET MY PROFILE (authenticated) ──────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id, u.username, u.full_name, u.email, u.mobile_number, u.city,
        u.avatar_url, u.bio, u.headline, u.website_url, u.github_username,
        u.linkedin_url, u.oauth_provider, u.is_profile_complete,
        u.is_assessment_done, u.created_at,
        r.elo_score, r.tier, r.technical_score, r.experience_score,
        r.teamwork_score, r.reliability_score, r.total_competitions,
        r.wins, r.podium_finishes, r.rating_confidence
       FROM users u
       LEFT JOIN user_ratings r ON r.user_id = u.id
       WHERE u.id = $1 AND u.is_active = true`,
      [req.user.id]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'User not found.' });

    const user = result.rows[0];

    // Skills — free text, no master table
    const skills = await pool.query(
      `SELECT id, name, category, proficiency_level, is_verified,
              verification_source, verification_score
       FROM user_skills
       WHERE user_id = $1
       ORDER BY category, name`,
      [user.id]
    );

    const linked = await pool.query(
      'SELECT platform, url, is_verified FROM user_linked_profiles WHERE user_id = $1',
      [user.id]
    );

    const certs = await pool.query(
      'SELECT id, title, issuer, issued_date, file_url, is_verified FROM user_certificates WHERE user_id = $1 ORDER BY issued_date DESC',
      [user.id]
    );

    const pastComps = await pool.query(
      'SELECT id, name, organizer, year, role, placement FROM user_past_competitions WHERE user_id = $1 ORDER BY year DESC',
      [user.id]
    );

    const projects = await pool.query(
      'SELECT id, title, description, role, outcome, link FROM user_projects WHERE user_id = $1',
      [user.id]
    );

    const prefs = await pool.query(
      'SELECT hours_per_week, preferred_role, preferred_comp_types, location_preference FROM user_preferences WHERE user_id = $1',
      [user.id]
    );

    res.json({
      success: true,
      profile: {
        ...user,
        skills:            skills.rows,
        linked_profiles:   linked.rows,
        certificates:      certs.rows,
        past_competitions: pastComps.rows,
        projects:          projects.rows,
        preferences:       prefs.rows[0] || null,
      },
    });
  } catch (err) {
    console.error('getMyProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET PUBLIC PROFILE (by username) ────────────────────────────────────────
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT 
        u.id, u.username, u.full_name, u.city, u.avatar_url, u.bio,
        u.headline, u.website_url, u.github_username, u.linkedin_url, u.created_at,
        r.elo_score, r.tier, r.technical_score, r.experience_score,
        r.teamwork_score, r.total_competitions, r.wins, r.podium_finishes, r.rating_confidence
       FROM users u
       LEFT JOIN user_ratings r ON r.user_id = u.id
       WHERE u.username = $1 AND u.is_active = true`,
      [username]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'User not found.' });

    const user = result.rows[0];

    // Skills — free text, no master table
    const skills = await pool.query(
      `SELECT name, category, proficiency_level, is_verified, verification_score
       FROM user_skills
       WHERE user_id = $1
       ORDER BY category, name`,
      [user.id]
    );

    const pastComps = await pool.query(
      'SELECT name, organizer, year, role, placement FROM user_past_competitions WHERE user_id = $1 ORDER BY year DESC',
      [user.id]
    );

    const projects = await pool.query(
      'SELECT title, description, role, outcome, link FROM user_projects WHERE user_id = $1',
      [user.id]
    );

    res.json({
      success: true,
      profile: {
        ...user,
        skills:            skills.rows,
        past_competitions: pastComps.rows,
        projects:          projects.rows,
      },
    });
  } catch (err) {
    console.error('getPublicProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── UPDATE BASIC PROFILE ─────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const {
      username, full_name, mobile_number, city,
      avatar_url, bio, headline, website_url, linkedin_url, github_username
    } = req.body;

    if (username) {
      const clash = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, req.user.id]
      );
      if (clash.rows.length > 0)
        return res.status(409).json({ success: false, message: 'Username already taken.' });
    }

    const result = await pool.query(
      `UPDATE users SET
        username            = COALESCE($1, username),
        full_name           = COALESCE($2, full_name),
        mobile_number       = COALESCE($3, mobile_number),
        city                = COALESCE($4, city),
        avatar_url          = COALESCE($5, avatar_url),
        bio                 = COALESCE($6, bio),
        headline            = COALESCE($7, headline),
        website_url         = COALESCE($8, website_url),
        linkedin_url        = COALESCE($9, linkedin_url),
        github_username     = COALESCE($10, github_username),
        is_profile_complete = TRUE,
        updated_at          = NOW()
       WHERE id = $11
       RETURNING id, username, full_name, mobile_number, city, avatar_url,
                 bio, headline, website_url, linkedin_url, github_username, is_profile_complete`,
      [username, full_name, mobile_number, city, avatar_url, bio, headline, website_url, linkedin_url, github_username, req.user.id]
    );

    res.json({ success: true, message: 'Profile updated.', user: result.rows[0] });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── SKILLS (free text — no master table) ────────────────────────────────────

// Add or update a skill manually
export const addSkill = async (req, res) => {
  try {
    const { name, proficiency_level } = req.body;
    if (!name?.trim())
      return res.status(400).json({ success: false, message: 'Skill name is required.' });

    // Infer category from name
    const category = inferCategory(name);

    const result = await pool.query(
      `INSERT INTO user_skills (user_id, name, category, proficiency_level)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, name) DO UPDATE SET
         proficiency_level = $4,
         category          = $3
       RETURNING *`,
      [req.user.id, name.trim(), category, proficiency_level || 'intermediate']
    );

    res.status(201).json({ success: true, skill: result.rows[0] });
  } catch (err) {
    console.error('addSkill error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Remove a skill by id
export const removeSkill = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_skills WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    res.json({ success: true, message: 'Skill removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── Category inference helper ────────────────────────────────────────────────
const inferCategory = (skillName) => {
  const s = skillName.toLowerCase();
  if (/react|vue|angular|next|svelte|html|css|tailwind|javascript|typescript|frontend|figma|ui|ux/.test(s)) return 'Frontend';
  if (/node|express|django|fastapi|flask|spring|rails|backend|api|rest|graphql|java|go|ruby|php|rust/.test(s)) return 'Backend';
  if (/python|ml|machine learning|deep learning|nlp|neural|tensorflow|pytorch|keras|sklearn|ai|llm|computer vision/.test(s)) return 'AI/ML';
  if (/sql|postgres|mysql|mongo|redis|database|firebase|supabase|pandas|numpy|tableau|power bi|data/.test(s)) return 'Data';
  if (/docker|kubernetes|aws|gcp|azure|ci\/cd|devops|linux|terraform|nginx|cloud/.test(s)) return 'DevOps';
  if (/figma|adobe|illustrator|photoshop|sketch|design|prototype|canva|blender/.test(s)) return 'Design';
  if (/solidity|blockchain|web3|ethereum|smart contract|crypto/.test(s)) return 'Web3';
  if (/finance|consulting|strategy|marketing|management|business|excel|case|mba/.test(s)) return 'Business';
  return 'Other';
};

// ─── LINKED PROFILES ─────────────────────────────────────────────────────────
export const addLinkedProfile = async (req, res) => {
  try {
    const { platform, url } = req.body;
    const result = await pool.query(
      `INSERT INTO user_linked_profiles (user_id, platform, url)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, platform) DO UPDATE SET url = $3
       RETURNING *`,
      [req.user.id, platform, url]
    );
    res.status(201).json({ success: true, linked: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────
export const addCertificate = async (req, res) => {
  try {
    const { file_url, title, issuer, issued_date } = req.body;
    const result = await pool.query(
      `INSERT INTO user_certificates (user_id, file_url, title, issuer, issued_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, file_url, title || null, issuer || null, issued_date || null]
    );
    res.status(201).json({ success: true, certificate: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_certificates WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    res.json({ success: true, message: 'Certificate removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── PAST COMPETITIONS ────────────────────────────────────────────────────────
export const addPastCompetition = async (req, res) => {
  try {
    const { name, organizer, year, role, placement } = req.body;
    const result = await pool.query(
      `INSERT INTO user_past_competitions (user_id, name, organizer, year, role, placement)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, name, organizer || null, year || null, role || null, placement || null]
    );
    res.status(201).json({ success: true, competition: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const deletePastCompetition = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_past_competitions WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    res.json({ success: true, message: 'Removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const addProject = async (req, res) => {
  try {
    const { title, description, role, outcome, link, skills_used } = req.body;
    const result = await pool.query(
      `INSERT INTO user_projects (user_id, title, description, role, outcome, link, skills_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, title, description || null, role || null, outcome || null, link || null, skills_used || []]
    );
    res.status(201).json({ success: true, project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, message: 'Project removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── PREFERENCES ─────────────────────────────────────────────────────────────
export const updatePreferences = async (req, res) => {
  try {
    const { hours_per_week, preferred_role, preferred_comp_types, location_preference } = req.body;
    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, hours_per_week, preferred_role, preferred_comp_types, location_preference)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         hours_per_week       = $2,
         preferred_role       = $3,
         preferred_comp_types = $4,
         location_preference  = $5,
         updated_at           = NOW()
       RETURNING *`,
      [req.user.id, hours_per_week, preferred_role, preferred_comp_types, location_preference]
    );
    res.json({ success: true, preferences: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};