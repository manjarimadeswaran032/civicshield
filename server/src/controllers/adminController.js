import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import Department from '../models/Department.js';
import ComplaintCategory from '../models/ComplaintCategory.js';
import AuditLog from '../models/AuditLog.js';
import SecurityEvent from '../models/SecurityEvent.js';
import SystemSetting from '../models/SystemSetting.js';
import bcrypt from 'bcryptjs';
import { AUDIT_ACTIONS, ROLES } from '../config/constants.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, isActive, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (department && department !== 'all') query.department = department;
    if (isActive !== undefined && isActive !== 'all') query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, address } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password || 'Admin@123456', salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || ROLES.OFFICER,
      department: department || null,
      phone: phone || '',
      address: address || '',
      isActive: true
    });

    await logAudit({
      req,
      action: AUDIT_ACTIONS.USER_REGISTER,
      resource: 'users',
      resourceId: user._id,
      details: { email: user.email, role: user.role, createdByAdmin: true }
    });

    res.status(201).json({
      success: true,
      message: `User created successfully with role ${user.role}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await logAudit({
      req,
      action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
      resource: 'users',
      resourceId: user._id,
      details: { previousRole, newRole: role }
    });

    res.json({
      success: true,
      message: `User role updated from ${previousRole} to ${role}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    await logAudit({
      req,
      action: AUDIT_ACTIONS.USER_STATUS_CHANGE,
      resource: 'users',
      resourceId: user._id,
      details: { isActive }
    });

    res.json({
      success: true,
      message: `User account has been ${isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.json({ success: true, roles });
  } catch (error) {
    next(error);
  }
};

export const getPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find().sort({ resource: 1 });
    res.json({ success: true, permissions });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('headOfDepartment', 'name email').sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, contactEmail, contactPhone, headOfDepartment } = req.body;
    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      contactEmail,
      contactPhone,
      headOfDepartment: headOfDepartment || null
    });

    await logAudit({
      req,
      action: AUDIT_ACTIONS.DEPARTMENT_CREATE,
      resource: 'departments',
      resourceId: department._id,
      details: { name: department.name, code: department.code }
    });

    res.status(201).json({ success: true, message: 'Department created successfully', department });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Department updated', department });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await ComplaintCategory.find().populate('defaultDepartment', 'name code').sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, code, description, icon, defaultDepartment, defaultPriority, defaultSlaHours } = req.body;
    const category = await ComplaintCategory.create({
      name,
      code: code.toUpperCase(),
      description,
      icon: icon || 'AlertCircle',
      defaultDepartment,
      defaultPriority: defaultPriority || 'Medium',
      defaultSlaHours: defaultSlaHours || 72
    });

    await logAudit({
      req,
      action: AUDIT_ACTIONS.CATEGORY_CREATE,
      resource: 'categories',
      resourceId: category._id,
      details: { name: category.name, code: category.code }
    });

    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await ComplaintCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Category updated', category });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resource, role, result, search, startDate, endDate, page = 1, limit = 25 } = req.query;
    const query = {};

    if (action && action !== 'all') query.action = action;
    if (resource && resource !== 'all') query.resource = resource;
    if (role && role !== 'all') query.role = role;
    if (result && result !== 'all') query.result = result;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      logs
    });
  } catch (error) {
    next(error);
  }
};

export const getSecurityEvents = async (req, res, next) => {
  try {
    const { eventType, severity, page = 1, limit = 25 } = req.query;
    const query = {};

    if (eventType && eventType !== 'all') query.eventType = eventType;
    if (severity && severity !== 'all') query.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await SecurityEvent.countDocuments(query);
    const events = await SecurityEvent.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      events
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.find();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateSystemSetting = async (req, res, next) => {
  try {
    const { key, value, description } = req.body;
    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value, description },
      { upsert: true, new: true }
    );

    await logAudit({
      req,
      action: AUDIT_ACTIONS.SYSTEM_SETTING_UPDATE,
      resource: 'settings',
      resourceId: key,
      details: { key, value }
    });

    res.json({ success: true, message: 'System setting updated', setting });
  } catch (error) {
    next(error);
  }
};
