import express from 'express';
import auth from '../middleware/auth.js';
import { getNotifications, markOneRead, markAllRead, sendMessage } from '../controllers/notificationController.js';

const notifRouter = express.Router();

notifRouter.get('/',              auth, getNotifications);
notifRouter.post('/message',      auth, sendMessage);
notifRouter.patch('/read',        auth, markAllRead);
notifRouter.patch('/:id/read',    auth, markOneRead);

export { notifRouter };
