import express from 'express';
import auth from '../middleware/auth.js';
import { sendInvite, getMyInvites, acceptInvite, declineInvite } from '../controllers/inviteController.js';

const inviteRouter = express.Router();

inviteRouter.post('/',              auth, sendInvite);
inviteRouter.get('/my',               auth, getMyInvites);
inviteRouter.patch('/:id/accept',   auth, acceptInvite);
inviteRouter.patch('/:id/decline',  auth, declineInvite);

export { inviteRouter };