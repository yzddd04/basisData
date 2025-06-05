import jwt from 'jsonwebtoken';
import Staff from '../models/staffModel.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Auth staff & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for staff email
    const staff = await Staff.findOne({ email, isDeleted: false });

    if (staff && (await staff.matchPassword(password))) {
      res.json({
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        token: generateToken(staff._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Get staff profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const staff = await Staff.findById(req.staff._id).select('-password');
    
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

// @desc    Register a new staff
// @route   POST /api/auth/register
// @access  Public
export const registerStaff = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if staff already exists
    const staffExists = await Staff.findOne({ email });

    if (staffExists) {
      res.status(400);
      throw new Error('Email already registered');
    }

    // Create staff with default role as librarian
    const staff = await Staff.create({
      name,
      email,
      password,
      phone,
      role: 'librarian', // Default role for public registration
    });

    if (staff) {
      res.status(201).json({
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        token: generateToken(staff._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid staff data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};