import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Helper untuk populate book/member/staff
async function populateTransaction(transaction, db) {
  if (!transaction) return null;
  const booksCollection = db.collection('books');
  const membersCollection = db.collection('members');
  const staffsCollection = db.collection('staff');
  const book = transaction.book ? await booksCollection.findOne({ _id: new ObjectId(transaction.book) }) : null;
  const member = transaction.member ? await membersCollection.findOne({ _id: new ObjectId(transaction.member) }) : null;
  const staff = transaction.staff ? await staffsCollection.findOne({ _id: new ObjectId(transaction.staff) }) : null;
  return {
    ...transaction,
    book,
    member,
    staff,
  };
}

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
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
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await transactionsCollection
      .find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ issueDate: -1 })
      .toArray();

    // Populate
    const populated = await Promise.all(transactions.map(t => populateTransaction(t, db)));
    const total = await transactionsCollection.countDocuments(query);

    res.json({
      transactions: populated,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
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
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });
    const populated = await populateTransaction(transaction, db);
    if (populated) {
      res.json(populated);
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
  try {
    const { bookId, memberId, dueDate } = req.body;
    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    const membersCollection = db.collection('members');
    const transactionsCollection = db.collection('transactions');
    const staffsCollection = db.collection('staff');

    // Check if book exists and is available
    const book = await booksCollection.findOne({ _id: new ObjectId(bookId), isDeleted: false });
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }
    if (book.availableCopies <= 0) {
      res.status(400);
      throw new Error('Book is not available for borrowing');
    }

    // Check if member exists and is eligible
    const member = await membersCollection.findOne({ _id: new ObjectId(memberId), isDeleted: false });
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }
    if (new Date(member.membershipExpiry) < new Date()) {
      res.status(400);
      throw new Error('Membership has expired');
    }
    if (member.fines > 0) {
      res.status(400);
      throw new Error('Member has unpaid fines. Please clear dues before borrowing');
    }

    // Gunakan staff dummy jika req.staff tidak ada (karena protect dibypass)
    const DUMMY_STAFF_ID = '6840753a1b0d986330e4f6f7';
    const staffId = req.staff?._id || DUMMY_STAFF_ID;
    const transaction = {
      book: bookId,
      member: memberId,
      staff: staffId,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'borrowed',
      isDeleted: false,
      issueDate: new Date(),
    };
    const result = await transactionsCollection.insertOne(transaction);

    // Update book available copies
    await booksCollection.updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { availableCopies: -1 } }
    );

    // Update member borrowing stats
    await membersCollection.updateOne(
      { _id: new ObjectId(memberId) },
      { $inc: { currentBorrowings: 1, totalBorrowings: 1 } }
    );

    const inserted = await transactionsCollection.findOne({ _id: result.insertedId });
    const populated = await populateTransaction(inserted, db);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Return a book
// @route   PUT /api/transactions/:id/return
// @access  Private
export const returnBook = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const booksCollection = db.collection('books');
    const membersCollection = db.collection('members');
    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(req.params.id),
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
      const dueDate = new Date(transaction.dueDate);
      const timeDiff = currentDate.getTime() - dueDate.getTime();
      const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
      fine = daysLate * 0.5;
    }

    // Update transaction
    await transactionsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { returnDate: currentDate, fine, status: 'returned' } }
    );

    // Update book available copies
    await booksCollection.updateOne(
      { _id: new ObjectId(transaction.book) },
      { $inc: { availableCopies: 1 } }
    );

    // Update member stats and add fine if applicable
    const memberUpdate = { $inc: { currentBorrowings: -1 } };
    if (fine > 0) {
      memberUpdate.$inc.fines = fine;
    }
    await membersCollection.updateOne(
      { _id: new ObjectId(transaction.member) },
      memberUpdate
    );

    const updated = await transactionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    const populated = await populateTransaction(updated, db);
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Pay fine
// @route   PUT /api/transactions/:id/pay-fine
// @access  Private
export const payFine = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const membersCollection = db.collection('members');
    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(req.params.id),
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
    await membersCollection.updateOne(
      { _id: new ObjectId(transaction.member) },
      { $inc: { fines: -amountPaid } }
    );
    // Update transaction
    await transactionsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { fine: Math.max(0, transaction.fine - amountPaid) } }
    );
    const updated = await transactionsCollection.findOne({ _id: new ObjectId(req.params.id) });
    const populated = await populateTransaction(updated, db);
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete transaction (soft delete)
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const trashesCollection = db.collection('trashes');
    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });
    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }
    await transactionsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    await trashesCollection.insertOne({
      modelName: 'Transaction',
      documentId: transaction._id,
      documentData: transaction,
      deletedBy: req.staff ? req.staff._id : null,
      deletedAt: new Date(),
    });
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check overdue transactions
// @route   POST /api/transactions/check-overdue
// @access  Private
export const checkOverdue = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const now = new Date();
    const result = await transactionsCollection.updateMany(
      {
        status: 'borrowed',
        dueDate: { $lt: now },
        isDeleted: false,
      },
      { $set: { status: 'overdue' } }
    );
    res.json({ message: `${result.modifiedCount} transactions marked as overdue` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};