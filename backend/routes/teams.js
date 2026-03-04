import express from 'express';
import auth from '../middleware/auth.js';
import {
  getMyTeams, getTeam, createTeam,
  joinTeam, leaveTeam, updateTeam,
} from '../controllers/teamController.js';

const router = express.Router();

router.get('/my',       auth, getMyTeams);
router.get('/:id',      auth, getTeam);
router.post('/',        auth, createTeam);
router.post('/join',    auth, joinTeam);
router.patch('/:id',    auth, updateTeam);
router.delete('/:id/leave', auth, leaveTeam);

export default router;
