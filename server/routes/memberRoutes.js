import express from 'express';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMemberTransactions,
} from '../controllers/memberController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes without authentication for testing
router.route('/').get(getMembers).post(createMember);
router.route('/:id').get(getMemberById).put(updateMember).delete(deleteMember);
router.route('/:id/transactions').get(getMemberTransactions);

export default router;