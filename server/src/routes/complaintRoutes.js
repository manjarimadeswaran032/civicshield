import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  trackPublicComplaint,
  reopenComplaint,
  confirmResolution,
  submitFeedback
} from '../controllers/complaintController.js';
import { authenticateUser } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { verifyComplaintOwnership } from '../middleware/ownership.js';
import { uploadComplaintImage } from '../middleware/upload.js';
import { publicTrackLimiter } from '../middleware/rateLimiter.js';
import {
  createComplaintValidator,
  reopenValidator,
  feedbackValidator
} from '../middleware/validators.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/track/:complaintId', publicTrackLimiter, trackPublicComplaint);

router.post('/', authenticateUser, authorizeRoles(ROLES.CITIZEN, ROLES.ADMIN), uploadComplaintImage.single('image'), createComplaintValidator, createComplaint);
router.get('/my', authenticateUser, authorizeRoles(ROLES.CITIZEN), getMyComplaints);
router.get('/:id', authenticateUser, verifyComplaintOwnership, getComplaintById);
router.put('/:id/reopen', authenticateUser, authorizeRoles(ROLES.CITIZEN), verifyComplaintOwnership, reopenValidator, reopenComplaint);
router.put('/:id/confirm-resolution', authenticateUser, authorizeRoles(ROLES.CITIZEN), verifyComplaintOwnership, confirmResolution);
router.post('/:id/feedback', authenticateUser, authorizeRoles(ROLES.CITIZEN), verifyComplaintOwnership, feedbackValidator, submitFeedback);

export default router;
