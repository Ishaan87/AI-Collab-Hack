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

// ─── SEND DIRECT MESSAGE ──────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    
    if (!receiver_id || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Missing receiver_id or message content.' });
    }

    const senderName = req.user.full_name || req.user.username;

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, related_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [receiver_id, 'direct_message', `New message from ${senderName}`, message.trim(), req.user.id]
    );

    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
