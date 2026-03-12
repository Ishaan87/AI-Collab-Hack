import express from 'express';
import auth from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import {
  getCompetitions, registerForCompetition, getMyCompetitions,
  createCompetition, getCompetition, withdrawFromCompetition,
  getWorkflow, getCollabSuggestions,
  getMyHostedEvents, getEventRegistrants,
} from '../controllers/competitionController.js';

const router = express.Router();

router.get('/',                      optionalAuth, getCompetitions);
router.get('/my',                    auth,         getMyCompetitions);
router.get('/hosted',                auth,         getMyHostedEvents);
router.get('/:id',                   optionalAuth, getCompetition);
router.post('/',                     auth,         createCompetition);
router.post('/:id/register',         auth,         registerForCompetition);
router.delete('/:id/withdraw',       auth,         withdrawFromCompetition);
router.get('/:id/workflow',          optionalAuth, getWorkflow);
router.post('/:id/collab',           auth,         getCollabSuggestions);
router.get('/:id/registrants',       auth,         getEventRegistrants);

export default router;
