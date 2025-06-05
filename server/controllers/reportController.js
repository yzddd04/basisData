import Transaction from '../models/transactionModel.js';
import Book from '../models/bookModel.js';
import Member from '../models/memberModel.js';

// @desc    Get popular books
// @route   GET /api/reports/popular-books
// @access  Private
export const getPopularBooks = async (req, res) => {
  try {
    const { limit = 10, period } = req.query;
    
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
    const popularBooks = await Transaction.aggregate([
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
    ]);

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
    const activeBorrowers = await Transaction.aggregate([
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
    ]);

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
    const overdueTransactions = await Transaction.find({
      status: 'overdue',
      isDeleted: false,
    })
      .populate('book', 'title author isbn')
      .populate('member', 'name email phone')
      .sort({ dueDate: 1 });

    res.json(overdueTransactions);
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
    const fineTransactions = await Transaction.find({
      ...dateFilter,
      fine: { $gt: 0 },
      returnDate: { $ne: null },
      isDeleted: false,
    })
      .populate('member', 'name email')
      .populate('book', 'title')
      .sort({ returnDate: -1 });

    // Calculate total fines
    const totalFines = fineTransactions.reduce(
      (total, transaction) => total + transaction.fine,
      0
    );

    res.json({
      transactions: fineTransactions,
      totalFines,
      count: fineTransactions.length,
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
    // Get book count by genre
    const booksByGenre = await Book.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get total books and available books
    const totalBooks = await Book.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalBooks: { $sum: '$copies' },
          availableBooks: { $sum: '$availableCopies' },
        },
      },
    ]);

    // Get books with low stock (less than 20% copies available)
    const lowStockBooks = await Book.find({
      isDeleted: false,
      $expr: {
        $lt: [
          { $divide: ['$availableCopies', '$copies'] },
          0.2,
        ],
      },
      copies: { $gt: 1 }, // Exclude books with only 1 copy
    }).select('title author isbn copies availableCopies');

    res.json({
      booksByGenre,
      totalBooks: totalBooks.length > 0 ? totalBooks[0] : { totalBooks: 0, availableBooks: 0 },
      lowStockBooks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};