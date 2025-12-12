import express from 'express';
import { validateProduct, validateObjectIdParam, validateComment } from '../middleware/validation.js';
import { authenticateAdmin, optionalAuth } from '../middleware/auth.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addDiscount,
  removeDiscount,
  addComment,
  deleteComment,
  getStockLevels,
  getStockHistory,
  uploadCSVProducts,
  uploadImages
} from '../controllers/productController.js';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure Multer
const upload = multer({ dest: join(__dirname, "../uploads/") });

// Public routes
router.get('/', getProducts);
router.get('/:id', validateObjectIdParam('id'), getProduct);
router.post('/stock', getStockLevels);

// Protected routes (Admin only)
router.post('/', authenticateAdmin, validateProduct, createProduct);
router.put('/:id', authenticateAdmin, validateObjectIdParam('id'), validateProduct, updateProduct);
router.delete('/:id', authenticateAdmin, validateObjectIdParam('id'), deleteProduct);
router.put('/:id/discount', authenticateAdmin, validateObjectIdParam('id'), addDiscount);
router.put('/:id/remove-discount', authenticateAdmin, validateObjectIdParam('id'), removeDiscount);
router.get('/:id/stock-history', authenticateAdmin, validateObjectIdParam('id'), getStockHistory);

// Comment routes
router.post('/:id/comments', validateObjectIdParam('id'), validateComment, addComment);
router.delete('/:id/comments/:commentId', authenticateAdmin, validateObjectIdParam('id'), validateObjectIdParam('commentId'), deleteComment);

// File upload routes (Admin only)
router.post('/upload-images', authenticateAdmin, upload.array("images", 10), uploadImages);
router.post('/upload-csv', authenticateAdmin, upload.single("file"), uploadCSVProducts);

export default router;