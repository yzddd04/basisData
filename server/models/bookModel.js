import mongoose from 'mongoose';

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please add an author'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'Please add an ISBN'],
      unique: true,
      trim: true,
    },
    publisher: {
      type: String,
      required: [true, 'Please add a publisher'],
      trim: true,
    },
    publicationYear: {
      type: Number,
      required: [true, 'Please add a publication year'],
    },
    genre: {
      type: String,
      required: [true, 'Please add a genre'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    copies: {
      type: Number,
      required: [true, 'Please add number of copies'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      default: function() {
        return this.copies;
      },
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

// Create index for search
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

const Book = mongoose.model('Book', bookSchema);

export default Book;