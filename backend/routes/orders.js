import express from 'express';
import { validateObjectIdParam } from '../middleware/validation.js';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';
import {
  getUserOrders,
  createOrder,
  validateStock,
  getAdminOrders,
  updateOrder,
  deleteOrder,
  cancelOrder
} from '../controllers/orderController.js';

const router = express.Router();

// User routes
router.get('/:userId', authenticateToken, validateObjectIdParam('userId'), getUserOrders);
router.post('/save', authenticateToken, createOrder);
router.post('/validate-stock', authenticateToken, validateStock);
router.post('/:orderId/cancel', authenticateToken, cancelOrder);

// Admin routes
router.get('/admin/all', authenticateAdmin, getAdminOrders);
router.put('/admin/:orderId', authenticateAdmin, updateOrder);
router.delete('/admin/:orderId', authenticateAdmin, deleteOrder);

export default router;