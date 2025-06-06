import express from 'express';
import {
  getTrashItems,
  getTrashItemById,
  restoreItem,
  permanentlyDeleteItem,
  emptyTrash,
  getSoftDeletedItems,
  restoreSoftDeletedItem,
  deleteSoftDeletedItem,
} from '../controllers/trashController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporarily remove 'protect' and 'admin' middleware for development
router.route('/')
  .get(getSoftDeletedItems);

router.delete('/empty', emptyTrash);

router.route('/:id')
  .get(getTrashItemById);

router.put('/:id/restore', restoreSoftDeletedItem);
router.delete('/:id', deleteSoftDeletedItem);

export default router;