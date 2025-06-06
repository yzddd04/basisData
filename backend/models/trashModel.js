import mongoose from 'mongoose';

const trashSchema = mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
      enum: ['Book', 'Member', 'Staff', 'Transaction'],
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    documentData: {
      type: Object,
      required: true,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: false,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
    restoredAt: {
      type: Date,
      default: null,
    },
    isRestored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Trash = mongoose.model('Trash', trashSchema);

export default Trash;