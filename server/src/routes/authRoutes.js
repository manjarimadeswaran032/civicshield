import express from 'express';
import { register, login, getMe, updateProfile, changePassword, logout } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerValidator, loginValidator } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);
router.put('/change-password', authenticateUser, changePassword);

export default router;
