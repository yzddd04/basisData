import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  returnBook,
  payFine,
  deleteTransaction,
  checkOverdue,
  getOverdueTransactions,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporarily remove 'protect' middleware for development
router.route('/')
  .get(getTransactions)
  .post(protect, createTransaction);

router.get('/check-overdue', checkOverdue);

router.route('/:id')
  .get(getTransactionById)
  .delete(deleteTransaction);

router.put('/:id/return', returnBook);
router.put('/:id/pay-fine', payFine);

router.get('/overdue', getOverdueTransactions);

export default router;