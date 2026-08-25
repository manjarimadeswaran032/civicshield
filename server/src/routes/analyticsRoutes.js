import express from 'express';
import { getOverviewStats, getDepartmentStats } from '../controllers/analyticsController.js';
import { authenticateUser } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/overview', getOverviewStats);
router.get('/departments', authenticateUser, authorizeRoles(ROLES.MANAGER, ROLES.ADMIN, ROLES.OFFICER), getDepartmentStats);

export default router;
