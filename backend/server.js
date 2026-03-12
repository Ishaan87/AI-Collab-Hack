import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from './config/passport.js';

import authRoutes        from './routes/auth.js';
import profileRoutes     from './routes/profile.js';
import competitionRoutes from './routes/competitions.js';
import teamRoutes        from './routes/teams.js';
import leaderboardRoutes from './routes/leaderboard.js';
import assessmentRoutes  from './routes/assessmentRoutes.js';
import { inviteRouter }  from './routes/invites.js';
import { notifRouter }   from './routes/notifications.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.FRONTEND_URL || 'http://localhost:5173')
      .replace(/\/$/, ''); // strip trailing slash
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || origin.replace(/\/$/, '') === allowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session needed briefly for OAuth handshake (we switch to JWT after)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 10 * 60 * 1000 }, // 10 min
}));
app.use(passport.initialize());
app.use(passport.session());

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/competitions',  competitionRoutes);
app.use('/api/teams',         teamRoutes);
app.use('/api/leaderboard',   leaderboardRoutes);
app.use('/api/assessment',    assessmentRoutes);
app.use('/api/invites',       inviteRouter);
app.use('/api/notifications', notifRouter);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` })
);

// ─── GLOBAL ERROR ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => console.log(`🚀 Server running → http://localhost:${PORT}`));

export default app;