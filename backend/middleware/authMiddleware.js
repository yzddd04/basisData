import jwt from 'jsonwebtoken';
import { Staff } from '../models/staffModel.js';
import { connectToDatabase } from '../config/db.js';

export const protect = async (req, res, next) => {
  // BYPASS AUTH UNTUK DEVELOPMENT/TESTING
  return next();

  // Hapus bypass development agar selalu autentikasi
  // if (process.env.NODE_ENV === 'development') {
  //   return next();
  // }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const db = await connectToDatabase();
      const staffCollection = db.collection('staff');
      const staffData = await staffCollection.findOne({ _id: decoded.id });

      if (!staffData) {
        console.error('protect middleware: staff not found for decoded.id', decoded.id);
        res.status(401);
        throw new Error('Not authorized, staff not found');
      }

      const staff = new Staff(staffData);
      req.staff = staff.toJSON();

      next();
    } catch (error) {
      console.error('protect middleware error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

export const admin = (req, res, next) => {
  // Skip admin check in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  if (req.staff && req.staff.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};