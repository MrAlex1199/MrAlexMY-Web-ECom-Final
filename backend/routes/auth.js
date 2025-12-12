import express from 'express';
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validateAdminRegistration,
  validatePasswordChange,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailChange,
  validateAccountDeletion
} from '../middleware/validation.js';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';
import { 
  registerUser, 
  loginUser, 
  registerAdmin, 
  loginAdmin, 
  getUserData, 
  getAdminData,
  changePassword,
  requestPasswordReset,
  resetPassword,
  changeEmail,
  deleteAccount,
  logoutUser,
  logoutAdmin,
  createMasterAdmin,
  getRoles
} from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // More lenient in development
  message: {
    error: "Too many login attempts from this IP, please try again later."
  }
});

// Separate rate limiter for data endpoints (more lenient)
const dataLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 500, // Very lenient for data fetching
  message: {
    error: "Too many requests from this IP, please try again later."
  }
});

// Very lenient rate limiter for admin verification (used frequently)
const adminVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 2000, // Very high limit for admin verification
  message: {
    error: "Too many admin verification requests from this IP, please try again later."
  }
});

// User routes
router.post('/register', authLimiter, validateUserRegistration, registerUser);
router.post('/login', authLimiter, validateUserLogin, loginUser);
router.post('/logout', logoutUser);
router.get('/user', dataLimiter, authenticateToken, getUserData);
router.put('/change-password', authenticateToken, validatePasswordChange, changePassword);

// Password recovery routes
router.post('/forgot-password', authLimiter, validatePasswordResetRequest, requestPasswordReset);
router.post('/reset-password', authLimiter, validatePasswordReset, resetPassword);

// Account management routes
router.put('/change-email', authenticateToken, validateEmailChange, changeEmail);
router.delete('/delete-account', authenticateToken, validateAccountDeletion, deleteAccount);

// Admin routes
router.post('/admin-register', authLimiter, validateAdminRegistration, registerAdmin);
router.post('/admin-login', authLimiter, validateUserLogin, loginAdmin);
router.post('/admin-logout', logoutAdmin);
router.get('/admin', adminVerifyLimiter, authenticateAdmin, getAdminData);
router.post('/create-master-admin', createMasterAdmin);
router.get('/roles', getRoles);

export default router;