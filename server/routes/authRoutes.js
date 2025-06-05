import express from 'express';
import { login, getProfile, registerStaff } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', registerStaff);
router.get('/profile', protect, getProfile);

export default router;