import express from 'express';
import auth from '../middleware/auth.js';
import { getLeaderboard, getMyRank } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/',      getLeaderboard);       // ?scope=global|city&city=Mumbai&page=1
router.get('/me',    auth, getMyRank);

export default router;
