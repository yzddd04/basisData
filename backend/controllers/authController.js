import jwt from 'jsonwebtoken';
import { Staff } from '../models/staffModel.js';
import { connectToDatabase } from '../config/db.js';

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
    const db = await connectToDatabase();
    const staffCollection = db.collection('staff');

    // Check for staff email
    const staffData = await staffCollection.findOne({ email, isDeleted: false });
    
    if (!staffData) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const staff = new Staff(staffData);
    const isMatch = await staff.matchPassword(password);

    if (isMatch) {
      res.json({
        _id: staffData._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        token: generateToken(staffData._id),
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
    const db = await connectToDatabase();
    const staffCollection = db.collection('staff');
    
    const staffData = await staffCollection.findOne({ _id: req.staff._id });
    
    if (staffData) {
      const staff = new Staff(staffData);
      res.json(staff.toJSON());
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
    const db = await connectToDatabase();
    const staffCollection = db.collection('staff');

    // Check if staff already exists
    const staffExists = await staffCollection.findOne({ email });

    if (staffExists) {
      res.status(400);
      throw new Error('Email already registered');
    }

    // Create new staff
    const hashedPassword = await Staff.hashPassword(password);
    const staff = new Staff({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'librarian', // Default role for public registration
    });

    const result = await staffCollection.insertOne(staff);

    if (result.acknowledged) {
      res.status(201).json({
        _id: result.insertedId,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        token: generateToken(result.insertedId),
      });
    } else {
      res.status(400);
      throw new Error('Invalid staff data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};