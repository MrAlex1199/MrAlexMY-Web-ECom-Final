import express from 'express';
import { validateCartItem, validateCartItemStrict, validateObjectIdParam } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// All cart routes require authentication
router.get('/:userId', authenticateToken, validateObjectIdParam('userId'), getCart);
router.post('/add', authenticateToken, validateCartItemStrict, addToCart);
router.post('/save-selected-products', validateCartItem, addToCart); // Legacy endpoint for backward compatibility (no auth required, handled in controller)
router.put('/update-quantity/:userId/:productId', authenticateToken, validateObjectIdParam('userId'), validateObjectIdParam('productId'), updateCartQuantity);
router.delete('/delete-product/:userId/:productId', authenticateToken, validateObjectIdParam('userId'), validateObjectIdParam('productId'), removeFromCart);
router.delete('/clear/:userId', authenticateToken, validateObjectIdParam('userId'), clearCart);

export default router;