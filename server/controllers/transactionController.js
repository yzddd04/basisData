import Transaction from '../models/transactionModel.js';
import Book from '../models/bookModel.js';
import Member from '../models/memberModel.js';
import Trash from '../models/trashModel.js';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.issueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.issueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.issueDate = { $lte: new Date(endDate) };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .populate('book', 'title author isbn')
      .populate('member', 'name email')
      .populate('staff', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ issueDate: -1 });

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate('book', 'title author isbn coverImage')
      .populate('member', 'name email phone')
      .populate('staff', 'name');

    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404);
      throw new Error('Transaction not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Create a transaction (issue book)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  console.log('CREATE TRANSACTION BODY:', req.body);
  try {
    const { bookId, memberId, dueDate } = req.body;

    // Check if book exists and is available
    const book = await Book.findOne({ _id: bookId, isDeleted: false });
    
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }
    
    if (book.availableCopies <= 0) {
      res.status(400);
      throw new Error('Book is not available for borrowing');
    }

    // Check if member exists and is eligible
    const member = await Member.findOne({ _id: memberId, isDeleted: false });
    
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }
    
    // Check if membership is valid
    if (new Date(member.membershipExpiry) < new Date()) {
      res.status(400);
      throw new Error('Membership has expired');
    }
    
    // Check if member has unpaid fines
    if (member.fines > 0) {
      res.status(400);
      throw new Error('Member has unpaid fines. Please clear dues before borrowing');
    }

    // Gunakan staff dummy jika req.staff tidak ada (karena protect dibypass)
    const DUMMY_STAFF_ID = '6840753a1b0d986330e4f6f7'; // Ganti dengan _id staff asli dari koleksi staff jika ada
    const staffId = req.staff?._id || DUMMY_STAFF_ID;
    const transaction = await Transaction.create({
      book: bookId,
      member: memberId,
      staff: staffId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
      status: 'borrowed',
    });

    // Update book available copies
    book.availableCopies -= 1;
    await book.save();

    // Update member borrowing stats
    member.currentBorrowings += 1;
    member.totalBorrowings += 1;
    await member.save();

    // Populate response data
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name email')
      .populate('staff', 'name');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error('CREATE TRANSACTION ERROR:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Return a book
// @route   PUT /api/transactions/:id/return
// @access  Private
export const returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'returned') {
      res.status(400);
      throw new Error('Book has already been returned');
    }

    // Calculate fine if book is returned late
    const currentDate = new Date();
    let fine = 0;

    if (currentDate > transaction.dueDate) {
      // Calculate days overdue
      const dueDate = new Date(transaction.dueDate);
      const timeDiff = currentDate.getTime() - dueDate.getTime();
      const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Apply fine rate ($0.50 per day)
      fine = daysLate * 0.5;
    }

    // Update transaction
    transaction.returnDate = currentDate;
    transaction.fine = fine;
    transaction.status = 'returned';
    await transaction.save();

    // Update book available copies
    const book = await Book.findById(transaction.book);
    book.availableCopies += 1;
    await book.save();

    // Update member stats and add fine if applicable
    const member = await Member.findById(transaction.member);
    member.currentBorrowings -= 1;
    
    if (fine > 0) {
      member.fines += fine;
    }
    
    await member.save();

    // Populate response data
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name email')
      .populate('staff', 'name');

    res.json(populatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Pay fine
// @route   PUT /api/transactions/:id/pay-fine
// @access  Private
export const payFine = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    if (transaction.fine <= 0) {
      res.status(400);
      throw new Error('No fine to pay for this transaction');
    }

    const { amountPaid } = req.body;
    
    if (!amountPaid || amountPaid <= 0) {
      res.status(400);
      throw new Error('Invalid amount paid');
    }

    // Get member to update their total fines
    const member = await Member.findById(transaction.member);
    
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Update transaction and member
    const finePaid = Math.min(transaction.fine, amountPaid);
    transaction.fine -= finePaid;
    await transaction.save();
    
    member.fines = Math.max(0, member.fines - finePaid);
    await member.save();

    res.json({
      message: `Payment of $${finePaid.toFixed(2)} received successfully`,
      remainingFine: transaction.fine,
      transactionId: transaction._id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a transaction (soft delete)
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (transaction) {
      // Soft delete
      transaction.isDeleted = true;
      transaction.deletedAt = Date.now();
      await transaction.save();

      // Add to trash
      await Trash.create({
        modelName: 'Transaction',
        documentId: transaction._id,
        documentData: transaction.toObject(),
        deletedBy: req.staff._id,
      });

      res.json({ message: 'Transaction removed' });
    } else {
      res.status(404);
      throw new Error('Transaction not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Check for overdue books and update status
// @route   GET /api/transactions/check-overdue
// @access  Private
export const checkOverdue = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Find all borrowed transactions that are overdue
    const overdueTransactions = await Transaction.find({
      status: 'borrowed',
      dueDate: { $lt: currentDate },
      isDeleted: false,
    });

    // Update status to overdue
    for (const transaction of overdueTransactions) {
      transaction.status = 'overdue';
      await transaction.save();
    }

    res.json({
      message: `${overdueTransactions.length} transactions marked as overdue`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};