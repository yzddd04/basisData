import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';
import Transaction from '../models/transactionModel.js';
import Trash from '../models/trashModel.js';

// @desc    Get all members
// @route   GET /api/members
// @access  Private
export const getMembers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    const query = { isDeleted: false };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const members = await membersCollection
      .find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 })
      .toArray();

    const total = await membersCollection.countDocuments(query);

    res.json({
      members,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
export const getMemberById = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    const member = await membersCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });

    if (member) {
      res.json(member);
    } else {
      res.status(404);
      throw new Error('Member not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Create a member
// @route   POST /api/members
// @access  Private
export const createMember = async (req, res) => {
  try {
    const { name, email, phone, address, membershipExpiry } = req.body;
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');

    // Check if member with email already exists
    const memberExists = await membersCollection.findOne({ email, isDeleted: false });

    if (memberExists) {
      res.status(400);
      throw new Error('Member with this email already exists');
    }

    const member = {
      name,
      email,
      phone,
      address,
      membershipExpiry: membershipExpiry ? new Date(membershipExpiry) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fines: 0,
      currentBorrowings: 0,
      totalBorrowings: 0,
    };

    const result = await membersCollection.insertOne(member);
    res.status(201).json({ ...member, _id: result.insertedId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a member
// @route   PUT /api/members/:id
// @access  Private
export const updateMember = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    const member = await membersCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });

    if (member) {
      const { name, email, phone, address, membershipExpiry } = req.body;

      // Check if another member has the same email
      if (email && email !== member.email) {
        const memberWithEmail = await membersCollection.findOne({
          email,
          isDeleted: false,
        });
        if (memberWithEmail) {
          res.status(400);
          throw new Error('Member with this email already exists');
        }
      }

      // Update fields
      const updateFields = {
        name: name || member.name,
        email: email || member.email,
        phone: phone || member.phone,
        address: address || member.address,
        membershipExpiry: membershipExpiry ? new Date(membershipExpiry) : member.membershipExpiry,
        updatedAt: new Date(),
      };

      await membersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateFields }
      );
      const updatedMember = await membersCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.json(updatedMember);
    } else {
      res.status(404);
      throw new Error('Member not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a member (soft delete)
// @route   DELETE /api/members/:id
// @access  Private
export const deleteMember = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    const transactionsCollection = db.collection('transactions');
    const trashesCollection = db.collection('trashes');
    const member = await membersCollection.findOne({
      _id: new ObjectId(req.params.id),
      isDeleted: false,
    });

    if (member) {
      // Check if member has active borrowings
      const activeTransactions = await transactionsCollection.countDocuments({
        member: member._id,
        status: { $in: ['borrowed', 'overdue'] },
        isDeleted: false,
      });

      if (activeTransactions > 0) {
        res.status(400);
        throw new Error(
          'Cannot delete member with active borrowings. Please return all books first.'
        );
      }

      // Soft delete
      await membersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );

      // Add to trash
      try {
        await trashesCollection.insertOne({
          modelName: 'Member',
          documentId: member._id,
          documentData: member,
          deletedBy: req.staff ? req.staff._id : null,
          deletedAt: new Date(),
        });
      } catch (err) {
        console.error('Failed to add to trash:', err);
      }

      res.json({ message: 'Member removed' });
    } else {
      res.status(404);
      throw new Error('Member not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get member's transactions
// @route   GET /api/members/:id/transactions
// @access  Private
export const getMemberTransactions = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const transactions = await transactionsCollection
      .find({
        member: new ObjectId(req.params.id),
        isDeleted: false,
      })
      .sort({ issueDate: -1 })
      .toArray();

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};