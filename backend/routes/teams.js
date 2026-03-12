import express from 'express';
import auth from '../middleware/auth.js';
import {
  getMyTeams, getTeam, createTeam,
  joinTeam, leaveTeam, updateTeam, removeMember
} from '../controllers/teamController.js';

const router = express.Router();

// ⚠️ Static routes MUST come before dynamic /:id routes
router.get('/my',           auth, getMyTeams);   // GET /api/teams/my
router.post('/join',        auth, joinTeam);      // POST /api/teams/join
router.post('/',            auth, createTeam);    // POST /api/teams

router.get('/:id',          auth, getTeam);       // GET /api/teams/:id
router.patch('/:id',        auth, updateTeam);    // PATCH /api/teams/:id
router.delete('/:id/leave', auth, leaveTeam);     // DELETE /api/teams/:id/leave
router.delete('/:id/members/:userId', auth, removeMember); // DELETE /api/teams/:id/members/:userId

export default router;