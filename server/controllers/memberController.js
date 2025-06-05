import Member from '../models/memberModel.js';
import Transaction from '../models/transactionModel.js';
import Trash from '../models/trashModel.js';

// @desc    Get all members
// @route   GET /api/members
// @access  Private
export const getMembers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const members = await Member.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Member.countDocuments(query);

    res.json({
      members,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
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
    const member = await Member.findOne({
      _id: req.params.id,
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

    // Check if member with email already exists
    const memberExists = await Member.findOne({ email, isDeleted: false });

    if (memberExists) {
      res.status(400);
      throw new Error('Member with this email already exists');
    }

    const member = await Member.create({
      name,
      email,
      phone,
      address,
      membershipExpiry: membershipExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a member
// @route   PUT /api/members/:id
// @access  Private
export const updateMember = async (req, res) => {
  try {
    const member = await Member.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (member) {
      const { name, email, phone, address, membershipExpiry } = req.body;

      // Check if another member has the same email
      if (email && email !== member.email) {
        const memberWithEmail = await Member.findOne({
          email,
          isDeleted: false,
        });
        if (memberWithEmail) {
          res.status(400);
          throw new Error('Member with this email already exists');
        }
      }

      // Update fields
      member.name = name || member.name;
      member.email = email || member.email;
      member.phone = phone || member.phone;
      member.address = address || member.address;
      member.membershipExpiry = membershipExpiry || member.membershipExpiry;

      const updatedMember = await member.save();
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
    const member = await Member.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (member) {
      // Check if member has active borrowings
      const activeTransactions = await Transaction.countDocuments({
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
      member.isDeleted = true;
      member.deletedAt = Date.now();
      await member.save();

      // Add to trash
      try {
        await Trash.create({
          modelName: 'Member',
          documentId: member._id,
          documentData: member.toObject(),
          deletedBy: req.staff ? req.staff._id : null,
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
    const transactions = await Transaction.find({
      member: req.params.id,
      isDeleted: false,
    })
      .populate('book', 'title author isbn')
      .sort({ issueDate: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};