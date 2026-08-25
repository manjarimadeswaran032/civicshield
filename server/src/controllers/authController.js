import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import SecurityEvent from '../models/SecurityEvent.js';
import { ROLES, AUDIT_ACTIONS, SECURITY_EVENT_TYPES } from '../config/constants.js';
import { logAudit } from '../middleware/auditLogger.js';

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'civicshield_super_secure_jwt_secret_key_2026_production_grade';
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address is already registered'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: ROLES.CITIZEN,
      phone: phone || '',
      address: address || '',
      isActive: true
    });

    await logAudit({
      req,
      action: AUDIT_ACTIONS.USER_REGISTER,
      resource: 'users',
      resourceId: user._id,
      details: { email: user.email, role: user.role },
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      role: user.role
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Citizen registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      await SecurityEvent.create({
        eventType: SECURITY_EVENT_TYPES.FAILED_LOGIN,
        severity: 'MEDIUM',
        description: `Failed login attempt for non-existent email: ${email}`,
        email,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        path: req.originalUrl,
        method: req.method
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.isLocked()) {
      await SecurityEvent.create({
        eventType: SECURITY_EVENT_TYPES.ACCOUNT_LOCKED,
        severity: 'HIGH',
        description: `Login attempt on locked account: ${email}`,
        email,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        path: req.originalUrl,
        method: req.method
      });

      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to excessive failed attempts. Please try again in 15 minutes.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();

      await SecurityEvent.create({
        eventType: SECURITY_EVENT_TYPES.FAILED_LOGIN,
        severity: user.failedLoginAttempts >= 3 ? 'HIGH' : 'MEDIUM',
        description: `Failed password verification for user ${email} (attempt ${user.failedLoginAttempts})`,
        email,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'] || '',
        path: req.originalUrl,
        method: req.method
      });

      await logAudit({
        req,
        action: AUDIT_ACTIONS.USER_LOGIN_FAILED,
        resource: 'users',
        resourceId: user._id,
        details: { email: user.email, attempts: user.failedLoginAttempts },
        result: 'FAILURE',
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        role: user.role
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact municipal administration.'
      });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    await logAudit({
      req,
      action: AUDIT_ACTIONS.USER_LOGIN,
      resource: 'users',
      resourceId: user._id,
      details: { email: user.email, role: user.role },
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      role: user.role
    });

    const token = generateToken(user._id, user.role);
    const populatedUser = await User.findById(user._id).populate('department', 'name code');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        department: populatedUser.department,
        phone: populatedUser.phone,
        address: populatedUser.address,
        isActive: populatedUser.isActive,
        lastLogin: populatedUser.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department', 'name code');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    await logAudit({
      req,
      action: AUDIT_ACTIONS.USER_UPDATE,
      resource: 'users',
      resourceId: user._id,
      details: { updatedFields: { name, phone, address } }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match'
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await SecurityEvent.create({
      eventType: SECURITY_EVENT_TYPES.PASSWORD_CHANGED,
      severity: 'LOW',
      description: `Password changed for user ${user.email}`,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      path: req.originalUrl,
      method: req.method
    });

    res.json({
      success: true,
      message: 'Password updated securely'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  if (req.user) {
    await logAudit({
      req,
      action: AUDIT_ACTIONS.USER_LOGOUT,
      resource: 'users',
      resourceId: req.user._id,
      details: { email: req.user.email }
    });
  }
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
