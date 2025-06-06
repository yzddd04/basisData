import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import Trash from '../models/trashModel.js';

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
export const getStaff = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const db = await connectToDatabase();
    const staffCollection = db.collection('staff');
    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const staff = await staffCollection
      .find(query, { projection: { password: 0 } })
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 })
      .toArray();

    const total = await staffCollection.countDocuments(query);

    res.json({
      staff,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get staff by ID
// @route   GET /api/staff/:id
// @access  Private/Admin
export const getStaffById = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const staffCollection = db.collection('staff');
    const staff = await staffCollection.findOne({ _id: new ObjectId(req.params.id) }, { projection: { password: 0 } });

    if (staff) {
      res.json(staff);
    } else {
      res.status(404);
      throw new Error('Staff not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Admin
export const updateStaff = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const staffCollection = db.collection('staff');
    const staff = await staffCollection.findOne({ _id: new ObjectId(req.params.id), isDeleted: false });

    if (staff) {
      const { name, email, role, phone, password } = req.body;

      // Check if another staff has the same email
      if (email && email !== staff.email) {
        const staffWithEmail = await staffCollection.findOne({ email, isDeleted: false });
        if (staffWithEmail) {
          res.status(400);
          throw new Error('Staff with this email already exists');
        }
      }

      // Update fields
      const updateFields = {
        name: name || staff.name,
        email: email || staff.email,
        role: role || staff.role,
        phone: phone || staff.phone,
        updatedAt: new Date(),
      };

      // Only update password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(password, salt);
      }

      await staffCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateFields }
      );

      const updatedStaff = await staffCollection.findOne({ _id: new ObjectId(req.params.id) }, { projection: { password: 0 } });

      res.json({
        _id: updatedStaff._id,
        name: updatedStaff.name,
        email: updatedStaff.email,
        role: updatedStaff.role,
        phone: updatedStaff.phone,
      });
    } else {
      res.status(404);
      throw new Error('Staff not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete staff (soft delete)
// @route   DELETE /api/staff/:id
// @access  Private/Admin
export const deleteStaff = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const staffCollection = db.collection('staff');
    const trashesCollection = db.collection('trashes');
    const staff = await staffCollection.findOne({ _id: new ObjectId(req.params.id), isDeleted: false });

    if (staff) {
      // Don't allow deleting the last admin
      if (staff.role === 'admin') {
        const adminCount = await staffCollection.countDocuments({ role: 'admin', isDeleted: false });

        if (adminCount <= 1) {
          res.status(400);
          throw new Error('Cannot delete the last admin');
        }
      }

      // Soft delete
      await staffCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );

      // Add to trash
      try {
        await trashesCollection.insertOne({
          modelName: 'Staff',
          documentId: staff._id,
          documentData: staff,
          deletedBy: req.staff ? req.staff._id : null,
          deletedAt: new Date(),
        });
      } catch (err) {
        console.error('Failed to add staff to trash:', err);
        return res.status(500).json({ message: 'Failed to add staff to trash', error: err });
      }

      res.json({ message: 'Staff removed' });
    } else {
      res.status(404);
      throw new Error('Staff not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};