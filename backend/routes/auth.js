import express from 'express';
import passport from '../config/passport.js';
import { oauthSuccess, oauthFailure } from '../controllers/authController.js';

const router = express.Router();

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/failure', session: false }),
  oauthSuccess
);

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/api/auth/failure', session: false }),
  oauthSuccess
);

router.get('/failure', oauthFailure);

export default router;
