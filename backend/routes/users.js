import express from 'express';
import { validateAddress, validateObjectIdParam } from '../middleware/validation.js';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';
import {
  saveAddress,
  updateAddress,
  deleteAddress,
  deleteAccount,
  getUsers,
  getAdmins
} from '../controllers/userController.js';

const router = express.Router();

// User address management
router.post('/save-address', authenticateToken, validateAddress, saveAddress);
router.put('/update-address/:userId/:addressId', authenticateToken, validateObjectIdParam('userId'), updateAddress);
router.delete('/delete-address/:userId/:addressId', authenticateToken, validateObjectIdParam('userId'), deleteAddress);
router.delete('/delete-account/:userId', authenticateToken, validateObjectIdParam('userId'), deleteAccount);

// Admin routes
router.get('/users', authenticateAdmin, getUsers);
router.get('/admins', authenticateAdmin, getAdmins);

export default router;