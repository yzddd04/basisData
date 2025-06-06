import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

// @desc    Get all trash items
// @route   GET /api/trash
// @access  Private/Admin
export const getTrashItems = async (req, res) => {
  try {
    const { modelName, page = 1, limit = 10 } = req.query;
    const db = await connectToDatabase();
    const trashesCollection = db.collection('trashes');
    const query = { isRestored: false };
    if (modelName) {
      query.modelName = modelName;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const trashItems = await trashesCollection
      .find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ deletedAt: -1 })
      .toArray();
    const total = await trashesCollection.countDocuments(query);
    res.json({
      trashItems,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
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
    const db = await connectToDatabase();
    const trashesCollection = db.collection('trashes');
    const trashItem = await trashesCollection.findOne({ _id: new ObjectId(req.params.id) });
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
    const db = await connectToDatabase();
    const trashesCollection = db.collection('trashes');
    const trashItem = await trashesCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!trashItem) {
      res.status(404);
      throw new Error('Trash item not found');
    }
    if (trashItem.isRestored) {
      res.status(400);
      throw new Error('Item has already been restored');
    }
    // Determine collection to restore to
    let collectionName;
    switch (trashItem.modelName) {
      case 'Book':
        collectionName = 'books';
        break;
      case 'Member':
        collectionName = 'members';
        break;
      case 'Staff':
        collectionName = 'staff';
        break;
      case 'Transaction':
        collectionName = 'transactions';
        break;
      default:
        res.status(400);
        throw new Error('Invalid model name');
    }
    const mainCollection = db.collection(collectionName);
    // Restore document
    await mainCollection.updateOne(
      { _id: trashItem.documentId },
      { $set: { isDeleted: false, deletedAt: null } }
    );
    // Update trash item
    await trashesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isRestored: true, restoredAt: new Date() } }
    );
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
    const db = await connectToDatabase();
    const trashesCollection = db.collection('trashes');
    const trashItem = await trashesCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!trashItem) {
      res.status(404);
      throw new Error('Trash item not found');
    }
    // Determine collection to delete from
    let collectionName;
    switch (trashItem.modelName) {
      case 'Book':
        collectionName = 'books';
        break;
      case 'Member':
        collectionName = 'members';
        break;
      case 'Staff':
        collectionName = 'staff';
        break;
      case 'Transaction':
        collectionName = 'transactions';
        break;
      default:
        res.status(400);
        throw new Error('Invalid model name');
    }
    const mainCollection = db.collection(collectionName);
    // Permanently delete the document
    await mainCollection.deleteOne({ _id: trashItem.documentId });
    // Delete the trash item
    await trashesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
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
    const db = await connectToDatabase();
    const trashesCollection = db.collection('trashes');
    const query = { isRestored: false };
    if (modelName) {
      query.modelName = modelName;
    }
    // Get all trash items
    const trashItems = await trashesCollection.find(query).toArray();
    // Group items by model name
    const itemsByModel = {};
    trashItems.forEach((item) => {
      if (!itemsByModel[item.modelName]) {
        itemsByModel[item.modelName] = [];
      }
      itemsByModel[item.modelName].push(item.documentId);
    });
    // Delete items from their respective collections
    for (const [modelName, ids] of Object.entries(itemsByModel)) {
      let collectionName;
      switch (modelName) {
        case 'Book':
          collectionName = 'books';
          break;
        case 'Member':
          collectionName = 'members';
          break;
        case 'Staff':
          collectionName = 'staff';
          break;
        case 'Transaction':
          collectionName = 'transactions';
          break;
        default:
          continue;
      }
      const mainCollection = db.collection(collectionName);
      await mainCollection.deleteMany({ _id: { $in: ids } });
    }
    // Delete all trash items
    await trashesCollection.deleteMany(query);
    res.json({
      message: `Trash emptied successfully. ${trashItems.length} items permanently deleted.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSoftDeletedItems = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    const staffsCollection = db.collection('staff');
    const booksCollection = db.collection('books');
    const deletedMembers = await membersCollection.find({ isDeleted: true }).toArray();
    const deletedStaffs = await staffsCollection.find({ isDeleted: true }).toArray();
    const deletedBooks = await booksCollection.find({ isDeleted: true }).toArray();
    const trash = [
      ...deletedMembers.map(item => ({ ...item, type: 'member' })),
      ...deletedStaffs.map(item => ({ ...item, type: 'staff' })),
      ...deletedBooks.map(item => ({ ...item, type: 'book' })),
    ];
    res.json(trash);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreSoftDeletedItem = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    const staffsCollection = db.collection('staff');
    const booksCollection = db.collection('books');
    // Try restore in all collections
    let updated = await membersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isDeleted: false, deletedAt: null } });
    if (updated.modifiedCount === 0) {
      updated = await staffsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isDeleted: false, deletedAt: null } });
    }
    if (updated.modifiedCount === 0) {
      updated = await booksCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isDeleted: false, deletedAt: null } });
    }
    if (updated.modifiedCount > 0) {
      res.json({ message: 'Item restored successfully' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSoftDeletedItem = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    const staffsCollection = db.collection('staff');
    const booksCollection = db.collection('books');
    // Try delete in all collections
    let deleted = await membersCollection.deleteOne({ _id: new ObjectId(id), isDeleted: true });
    if (deleted.deletedCount === 0) {
      deleted = await staffsCollection.deleteOne({ _id: new ObjectId(id), isDeleted: true });
    }
    if (deleted.deletedCount === 0) {
      deleted = await booksCollection.deleteOne({ _id: new ObjectId(id), isDeleted: true });
    }
    if (deleted.deletedCount > 0) {
      res.json({ message: 'Item permanently deleted' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};