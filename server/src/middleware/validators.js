import { body, param, query, validationResult } from 'express-validator';
import { COMPLAINT_PRIORITY, COMPLAINT_STATUS, ROLES } from '../config/constants.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: ' + errors.array().map(e => e.msg).join(', '),
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and a number'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  validate
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

export const createComplaintValidator = [
  body('title').trim().notEmpty().withMessage('Complaint title is required').isLength({ max: 150 }).withMessage('Title too long'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('priority').optional().isIn(Object.values(COMPLAINT_PRIORITY)).withMessage('Invalid priority level'),
  body('address').trim().notEmpty().withMessage('Location address is required'),
  validate
];

export const updateStatusValidator = [
  body('status').isIn(Object.values(COMPLAINT_STATUS)).withMessage('Invalid complaint status'),
  body('remarks').optional().trim(),
  validate
];

export const reopenValidator = [
  body('reason').trim().notEmpty().withMessage('Reopening rationale is required').isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters'),
  validate
];

export const feedbackValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  validate
];

export const updateRoleValidator = [
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role specified'),
  validate
];
