import Trash from '../models/trashModel.js';
import Book from '../models/bookModel.js';
import Member from '../models/memberModel.js';
import Staff from '../models/staffModel.js';
import Transaction from '../models/transactionModel.js';

// @desc    Get all trash items
// @route   GET /api/trash
// @access  Private/Admin
export const getTrashItems = async (req, res) => {
  try {
    const { modelName, page = 1, limit = 10 } = req.query;
    const query = { isRestored: false };

    // Filter by model name
    if (modelName) {
      query.modelName = modelName;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const trashItems = await Trash.find(query)
      .populate('deletedBy', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ deletedAt: -1 });

    const total = await Trash.countDocuments(query);

    res.json({
      trashItems,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trash item by ID
// @route   GET /api/trash/:id
// @access  Private/Admin
export const getTrashItemById = async (req, res) => {
  try {
    const trashItem = await Trash.findById(req.params.id).populate(
      'deletedBy',
      'name'
    );

    if (trashItem) {
      res.json(trashItem);
    } else {
      res.status(404);
      throw new Error('Trash item not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Restore item from trash
// @route   PUT /api/trash/:id/restore
// @access  Private/Admin
export const restoreItem = async (req, res) => {
  try {
    const trashItem = await Trash.findById(req.params.id);

    if (!trashItem) {
      res.status(404);
      throw new Error('Trash item not found');
    }

    if (trashItem.isRestored) {
      res.status(400);
      throw new Error('Item has already been restored');
    }

    // Determine model to restore to
    let Model;
    switch (trashItem.modelName) {
      case 'Book':
        Model = Book;
        break;
      case 'Member':
        Model = Member;
        break;
      case 'Staff':
        Model = Staff;
        break;
      case 'Transaction':
        Model = Transaction;
        break;
      default:
        res.status(400);
        throw new Error('Invalid model name');
    }

    // Find the document to restore
    const document = await Model.findById(trashItem.documentId);

    if (!document) {
      res.status(404);
      throw new Error(`${trashItem.modelName} not found`);
    }

    // Restore document
    document.isDeleted = false;
    document.deletedAt = null;
    await document.save();

    // Update trash item
    trashItem.isRestored = true;
    trashItem.restoredAt = Date.now();
    await trashItem.save();

    res.json({
      message: `${trashItem.modelName} restored successfully`,
      trashItem,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Permanently delete item
// @route   DELETE /api/trash/:id
// @access  Private/Admin
export const permanentlyDeleteItem = async (req, res) => {
  try {
    const trashItem = await Trash.findById(req.params.id);

    if (!trashItem) {
      res.status(404);
      throw new Error('Trash item not found');
    }

    // Determine model to delete from
    let Model;
    switch (trashItem.modelName) {
      case 'Book':
        Model = Book;
        break;
      case 'Member':
        Model = Member;
        break;
      case 'Staff':
        Model = Staff;
        break;
      case 'Transaction':
        Model = Transaction;
        break;
      default:
        res.status(400);
        throw new Error('Invalid model name');
    }

    // Permanently delete the document
    await Model.findByIdAndDelete(trashItem.documentId);

    // Delete the trash item
    await Trash.findByIdAndDelete(trashItem._id);

    res.json({
      message: `${trashItem.modelName} permanently deleted`,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Empty trash (permanently delete all trash items)
// @route   DELETE /api/trash/empty
// @access  Private/Admin
export const emptyTrash = async (req, res) => {
  try {
    const { modelName } = req.query;
    const query = { isRestored: false };

    // Filter by model name
    if (modelName) {
      query.modelName = modelName;
    }

    // Get all trash items
    const trashItems = await Trash.find(query);

    // Group items by model name
    const itemsByModel = {};
    trashItems.forEach((item) => {
      if (!itemsByModel[item.modelName]) {
        itemsByModel[item.modelName] = [];
      }
      itemsByModel[item.modelName].push(item.documentId);
    });

    // Delete items from their respective models
    for (const [modelName, ids] of Object.entries(itemsByModel)) {
      let Model;
      switch (modelName) {
        case 'Book':
          Model = Book;
          break;
        case 'Member':
          Model = Member;
          break;
        case 'Staff':
          Model = Staff;
          break;
        case 'Transaction':
          Model = Transaction;
          break;
        default:
          continue;
      }
      await Model.deleteMany({ _id: { $in: ids } });
    }

    // Delete all trash items
    await Trash.deleteMany(query);

    res.json({
      message: `Trash emptied successfully. ${trashItems.length} items permanently deleted.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSoftDeletedItems = async (req, res) => {
  try {
    const deletedMembers = await Member.find({ isDeleted: true });
    const deletedStaffs = await Staff.find({ isDeleted: true });
    const deletedBooks = await Book.find({ isDeleted: true });

    const trash = [
      ...deletedMembers.map(item => ({ ...item.toObject(), type: 'member' })),
      ...deletedStaffs.map(item => ({ ...item.toObject(), type: 'staff' })),
      ...deletedBooks.map(item => ({ ...item.toObject(), type: 'book' })),
    ];

    res.json(trash);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreSoftDeletedItem = async (req, res) => {
  const { id } = req.params;
  const type = req.body.type || req.query.type;
  let Model;
  if (type === 'member') Model = Member;
  else if (type === 'staff') Model = Staff;
  else if (type === 'book') Model = Book;
  else return res.status(400).json({ message: 'Invalid type' });

  try {
    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ message: 'Item not found' });
    doc.isDeleted = false;
    doc.deletedAt = null;
    await doc.save();
    res.json({ message: 'Item restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSoftDeletedItem = async (req, res) => {
  const { id } = req.params;
  const type = req.body.type || req.query.type;
  let Model;
  if (type === 'member') Model = Member;
  else if (type === 'staff') Model = Staff;
  else if (type === 'book') Model = Book;
  else return res.status(400).json({ message: 'Invalid type' });

  try {
    await Model.findByIdAndDelete(id);
    res.json({ message: 'Item deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};