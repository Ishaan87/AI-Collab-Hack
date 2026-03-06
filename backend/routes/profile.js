import express from 'express';
import auth from '../middleware/auth.js';
import {
  getMyProfile, getPublicProfile, updateProfile,
  addSkill, removeSkill,
  addLinkedProfile,
  addCertificate, deleteCertificate,
  addPastCompetition, deletePastCompetition,
  addProject, deleteProject,
  updatePreferences,
} from '../controllers/profileController.js';

const router = express.Router();

// My profile (authenticated)
router.get('/me',                          auth, getMyProfile);
router.put('/me',                          auth, updateProfile);
router.post('/me/skills',                  auth, addSkill);
router.delete('/me/skills/:id',            auth, removeSkill);   // ← changed :skill_id to :id
router.post('/me/linked-profiles',         auth, addLinkedProfile);
router.post('/me/certificates',            auth, addCertificate);
router.delete('/me/certificates/:id',      auth, deleteCertificate);
router.post('/me/past-competitions',       auth, addPastCompetition);
router.delete('/me/past-competitions/:id', auth, deletePastCompetition);
router.post('/me/projects',                auth, addProject);
router.delete('/me/projects/:id',          auth, deleteProject);
router.put('/me/preferences',              auth, updatePreferences);

// Public profile
router.get('/:username', getPublicProfile);

export default router;