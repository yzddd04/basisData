import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookGenres,
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporarily remove 'protect' and 'admin' middleware for development
router.route('/')
  .get(getBooks)
  .post(createBook);

router.get('/genres', getBookGenres);

router.route('/:id')
  .get(getBookById)
  .put(updateBook)
  .delete(deleteBook);

export default router;