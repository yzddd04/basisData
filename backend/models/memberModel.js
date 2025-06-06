import mongoose from 'mongoose';

const memberSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
      trim: true,
    },
    membershipDate: {
      type: Date,
      default: Date.now,
    },
    membershipExpiry: {
      type: Date,
      required: true,
    },
    currentBorrowings: {
      type: Number,
      default: 0,
    },
    totalBorrowings: {
      type: Number,
      default: 0,
    },
    fines: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

memberSchema.index({ name: 'text', email: 'text' });

const Member = mongoose.model('Member', memberSchema);

export default Member;