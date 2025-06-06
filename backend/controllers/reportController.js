import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

// @desc    Get popular books
// @route   GET /api/reports/popular-books
// @access  Private
export const getPopularBooks = async (req, res) => {
  try {
    const { limit = 10, period } = req.query;
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    // Create date filter based on period
    let dateFilter = {};
    const currentDate = new Date();
    if (period === 'week') {
      const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { issueDate: { $gte: lastWeek } };
    } else if (period === 'month') {
      const lastMonth = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { issueDate: { $gte: lastMonth } };
    } else if (period === 'year') {
      const lastYear = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { issueDate: { $gte: lastYear } };
    }
    // Aggregate popular books
    const popularBooks = await transactionsCollection.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
      { $unwind: '$bookDetails' },
      {
        $project: {
          _id: '$bookDetails._id',
          title: '$bookDetails.title',
          author: '$bookDetails.author',
          isbn: '$bookDetails.isbn',
          genre: '$bookDetails.genre',
          coverImage: '$bookDetails.coverImage',
          borrowCount: '$count',
        },
      },
    ]).toArray();
    res.json(popularBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active borrowers
// @route   GET /api/reports/active-borrowers
// @access  Private
export const getActiveBorrowers = async (req, res) => {
  try {
    const { limit = 10, period } = req.query;
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    // Create date filter based on period
    let dateFilter = {};
    const currentDate = new Date();
    if (period === 'week') {
      const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { issueDate: { $gte: lastWeek } };
    } else if (period === 'month') {
      const lastMonth = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { issueDate: { $gte: lastMonth } };
    } else if (period === 'year') {
      const lastYear = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = { issueDate: { $gte: lastYear } };
    }
    // Aggregate active borrowers
    const activeBorrowers = await transactionsCollection.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      { $group: { _id: '$member', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'memberDetails',
        },
      },
      { $unwind: '$memberDetails' },
      {
        $project: {
          _id: '$memberDetails._id',
          name: '$memberDetails.name',
          email: '$memberDetails.email',
          membershipDate: '$memberDetails.membershipDate',
          borrowCount: '$count',
        },
      },
    ]).toArray();
    res.json(activeBorrowers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overdue books report
// @route   GET /api/reports/overdue-books
// @access  Private
export const getOverdueBooks = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const booksCollection = db.collection('books');
    const membersCollection = db.collection('members');
    // Cari transaksi overdue
    const overdueTransactions = await transactionsCollection
      .find({ status: 'overdue', isDeleted: false })
      .sort({ dueDate: 1 })
      .toArray();
    // Populate manual
    const populated = await Promise.all(overdueTransactions.map(async (t) => {
      const book = t.book ? await booksCollection.findOne({ _id: new ObjectId(t.book) }) : null;
      const member = t.member ? await membersCollection.findOne({ _id: new ObjectId(t.member) }) : null;
      return { ...t, book, member };
    }));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fine collection report
// @route   GET /api/reports/fine-collections
// @access  Private
export const getFineCollections = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const membersCollection = db.collection('members');
    const booksCollection = db.collection('books');
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        returnDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else if (startDate) {
      dateFilter = { returnDate: { $gte: new Date(startDate) } };
    } else if (endDate) {
      dateFilter = { returnDate: { $lte: new Date(endDate) } };
    }
    // Get transactions with fines
    const fineTransactions = await transactionsCollection
      .find({
        ...dateFilter,
        fine: { $gt: 0 },
        returnDate: { $ne: null },
        isDeleted: false,
      })
      .sort({ returnDate: -1 })
      .toArray();
    // Populate manual
    const populated = await Promise.all(fineTransactions.map(async (t) => {
      const member = t.member ? await membersCollection.findOne({ _id: new ObjectId(t.member) }) : null;
      const book = t.book ? await booksCollection.findOne({ _id: new ObjectId(t.book) }) : null;
      return { ...t, member, book };
    }));
    // Calculate total fines
    const totalFines = populated.reduce((total, transaction) => total + (transaction.fine || 0), 0);
    res.json({
      transactions: populated,
      totalFines,
      count: populated.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory status
// @route   GET /api/reports/inventory
// @access  Private
export const getInventoryStatus = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    // Get book count by genre
    const booksByGenre = await booksCollection.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();
    // Get total books and available books
    const totalBooksAgg = await booksCollection.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalBooks: { $sum: '$copies' },
          availableBooks: { $sum: '$availableCopies' },
        },
      },
    ]).toArray();
    // Get books with low stock (less than 20% copies available)
    const lowStockBooks = await booksCollection
      .find({
        isDeleted: false,
        $expr: {
          $lt: [
            { $divide: ['$availableCopies', '$copies'] },
            0.2,
          ],
        },
        copies: { $gt: 1 },
      })
      .project({ title: 1, author: 1, isbn: 1, copies: 1, availableCopies: 1 })
      .toArray();
    res.json({
      booksByGenre,
      totalBooks: totalBooksAgg.length > 0 ? totalBooksAgg[0] : { totalBooks: 0, availableBooks: 0 },
      lowStockBooks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};