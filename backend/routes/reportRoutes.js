import express from 'express';
import {
  getPopularBooks,
  getActiveBorrowers,
  getOverdueBooks,
  getFineCollections,
  getInventoryStatus,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporarily remove 'protect' middleware for development
router.get('/popular-books', getPopularBooks);
router.get('/active-borrowers', getActiveBorrowers);
router.get('/overdue-books', getOverdueBooks);
router.get('/fine-collections', getFineCollections);
router.get('/inventory', getInventoryStatus);

export default router;