import express from 'express';
import auth from '../middleware/auth.js';
import {
  getCompetitions, getCompetition, createCompetition,
  registerForCompetition, withdrawFromCompetition,
  getMyCompetitions,
} from '../controllers/competitionController.js';

const router = express.Router();

router.get('/',              getCompetitions);
router.get('/my',            auth, getMyCompetitions);
router.get('/:id',           getCompetition);
router.post('/',             auth, createCompetition);
router.post('/:id/register', auth, registerForCompetition);
router.patch('/:id/withdraw',auth, withdrawFromCompetition);

export default router;
