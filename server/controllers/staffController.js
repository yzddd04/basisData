import Staff from '../models/staffModel.js';
import Trash from '../models/trashModel.js';

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
export const getStaff = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
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
    const skip = (page - 1) * limit;

    const staff = await Staff.find(query)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Staff.countDocuments(query);

    res.json({
      staff,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
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
    const staff = await Staff.findOne({ _id: req.params.id }).select('-password');

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
    const staff = await Staff.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (staff) {
      const { name, email, role, phone, password } = req.body;

      // Check if another staff has the same email
      if (email && email !== staff.email) {
        const staffWithEmail = await Staff.findOne({
          email,
          isDeleted: false,
        });
        if (staffWithEmail) {
          res.status(400);
          throw new Error('Staff with this email already exists');
        }
      }

      // Update fields
      staff.name = name || staff.name;
      staff.email = email || staff.email;
      staff.role = role || staff.role;
      staff.phone = phone || staff.phone;

      // Only update password if provided
      if (password) {
        staff.password = password;
      }

      const updatedStaff = await staff.save();

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
    const staff = await Staff.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (staff) {
      // Don't allow deleting the last admin
      if (staff.role === 'admin') {
        const adminCount = await Staff.countDocuments({
          role: 'admin',
          isDeleted: false,
        });

        if (adminCount <= 1) {
          res.status(400);
          throw new Error('Cannot delete the last admin');
        }
      }

      // Soft delete
      staff.isDeleted = true;
      staff.deletedAt = Date.now();
      await staff.save();

      // Add to trash
      try {
        await Trash.create({
          modelName: 'Staff',
          documentId: staff._id,
          documentData: staff.toObject(),
          deletedBy: req.staff ? req.staff._id : null,
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