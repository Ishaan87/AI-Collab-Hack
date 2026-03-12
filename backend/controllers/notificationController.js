import pool from '../config/db.js';

// ─── GET NOTIFICATIONS ────────────────────────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [req.user.id]
    );

    const unread = result.rows.filter(n => !n.is_read).length;

    res.json({ success: true, notifications: result.rows, unread_count: unread });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── MARK ONE READ ────────────────────────────────────────────────────────────
export const markOneRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── MARK ALL READ ────────────────────────────────────────────────────────────
export const markAllRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
