import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  getRoles,
  getPermissions,
  getDepartments,
  createDepartment,
  updateDepartment,
  getCategories,
  createCategory,
  updateCategory,
  getAuditLogs,
  getSecurityEvents,
  getSystemSettings,
  updateSystemSetting
} from '../controllers/adminController.js';
import { authenticateUser } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { updateRoleValidator } from '../middleware/validators.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.ADMIN));

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id/role', updateRoleValidator, updateUserRole);
router.put('/users/:id/status', updateUserStatus);

router.get('/roles', getRoles);
router.get('/permissions', getPermissions);

router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);

router.get('/audit-logs', getAuditLogs);
router.get('/security-events', getSecurityEvents);

router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSetting);

export default router;
