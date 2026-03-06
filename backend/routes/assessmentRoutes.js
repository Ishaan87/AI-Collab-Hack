import express from 'express';
import auth from '../middleware/auth.js';
import { getAssessmentStatus, submitAssessment } from '../controllers/assessmentController.js';

const router = express.Router();

router.get('/status', auth, getAssessmentStatus);  // GET  /api/assessment/status
router.post('/submit', auth, submitAssessment);     // POST /api/assessment/submit

export default router;
