import express from 'express';
import {
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporarily remove 'protect' and 'admin' middleware for development
router.route('/').get(getStaff).post(async (req, res, next) => {
  // Import controller secara dinamis agar tidak perlu refactor besar
  const { registerStaff } = await import('../controllers/authController.js');
  return registerStaff(req, res, next);
});

router.route('/:id')
  .get(getStaffById)
  .put(updateStaff)
  .delete(deleteStaff);

export default router;