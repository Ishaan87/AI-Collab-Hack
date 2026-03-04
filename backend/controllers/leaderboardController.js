import pool from '../config/db.js';

// ─── GLOBAL LEADERBOARD ───────────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const { scope = 'global', city, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['u.is_active = true', 'u.is_profile_complete = true'];
    const params = [];

    // City filter (for local leaderboard)
    if (scope === 'city' && city) {
      params.push(city);
      conditions.push(`u.city ILIKE $${params.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(
      `SELECT 
        u.id, u.username, u.full_name, u.avatar_url, u.city, u.headline,
        r.elo_score, r.tier, r.total_competitions, r.wins, r.podium_finishes,
        r.rating_confidence,
        ROW_NUMBER() OVER (ORDER BY r.elo_score DESC)::int AS rank
       FROM users u
       JOIN user_ratings r ON r.user_id = u.id
       ${where}
       ORDER BY r.elo_score DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM users u JOIN user_ratings r ON r.user_id = u.id ${where}`,
      params.slice(0, -2)
    );

    res.json({
      success: true,
      leaderboard: result.rows,
      pagination: {
        total: parseInt(total.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total.rows[0].count / limit),
      },
    });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET MY RANK ──────────────────────────────────────────────────────────────
export const getMyRank = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rank, elo_score, tier FROM (
        SELECT 
          u.id,
          r.elo_score,
          r.tier,
          ROW_NUMBER() OVER (ORDER BY r.elo_score DESC)::int AS rank
        FROM users u
        JOIN user_ratings r ON r.user_id = u.id
        WHERE u.is_active = true AND u.is_profile_complete = true
      ) ranked
      WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows.length)
      return res.json({ success: true, rank: null, message: 'Complete your profile to appear on the leaderboard.' });

    res.json({ success: true, ...result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
