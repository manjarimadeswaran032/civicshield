import express from 'express';
import {
  getOfficerComplaints,
  updateComplaintStatus,
  assignComplaint,
  resolveComplaint,
  escalateComplaint
} from '../controllers/officerController.js';
import { authenticateUser } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { uploadComplaintImage } from '../middleware/upload.js';
import { updateStatusValidator } from '../middleware/validators.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.OFFICER, ROLES.MANAGER, ROLES.ADMIN));

router.get('/complaints', getOfficerComplaints);
router.put('/complaints/:id/status', updateStatusValidator, updateComplaintStatus);
router.put('/complaints/:id/assign', authorizeRoles(ROLES.MANAGER, ROLES.ADMIN), assignComplaint);
router.put('/complaints/:id/resolve', uploadComplaintImage.single('proofImage'), resolveComplaint);
router.put('/complaints/:id/escalate', escalateComplaint);

export default router;
