import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

// @desc    Get all books
// @route   GET /api/books
// @access  Private
export const getBooks = async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 10 } = req.query;
    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    const query = { $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by genre
    if (genre) {
      query.genre = genre;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const books = await booksCollection
      .find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 })
      .toArray();

    const total = await booksCollection.countDocuments(query);

    res.json({
      books,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Private
export const getBookById = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    const book = await booksCollection.findOne({ _id: new ObjectId(req.params.id), isDeleted: false });

    if (book) {
      res.json(book);
    } else {
      res.status(404);
      throw new Error('Book not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private
export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      publisher,
      publicationYear,
      genre,
      description,
      coverImage,
      copies,
    } = req.body;
    const db = await connectToDatabase();
    const booksCollection = db.collection('books');

    // Check if book with ISBN already exists
    const bookExists = await booksCollection.findOne({ isbn, isDeleted: false });

    if (bookExists) {
      res.status(400);
      throw new Error('Book with this ISBN already exists');
    }

    const book = {
      title,
      author,
      isbn,
      publisher,
      publicationYear,
      genre,
      description,
      coverImage,
      copies,
      availableCopies: copies,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await booksCollection.insertOne(book);
    res.status(201).json({ ...book, _id: result.insertedId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
export const updateBook = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    const book = await booksCollection.findOne({ _id: new ObjectId(req.params.id), isDeleted: false });

    if (book) {
      const {
        title,
        author,
        isbn,
        publisher,
        publicationYear,
        genre,
        description,
        coverImage,
        copies,
      } = req.body;

      // Check if another book has the same ISBN
      if (isbn && isbn !== book.isbn) {
        const bookWithIsbn = await booksCollection.findOne({ isbn, isDeleted: false });
        if (bookWithIsbn) {
          res.status(400);
          throw new Error('Book with this ISBN already exists');
        }
      }

      // Update fields
      const updateFields = {
        title: title || book.title,
        author: author || book.author,
        isbn: isbn || book.isbn,
        publisher: publisher || book.publisher,
        publicationYear: publicationYear || book.publicationYear,
        genre: genre || book.genre,
        description: description || book.description,
        coverImage: coverImage || book.coverImage,
        updatedAt: new Date(),
      };

      // Handle copies update
      if (copies !== undefined) {
        const copiesDiff = copies - book.copies;
        updateFields.copies = copies;
        updateFields.availableCopies = Math.max(0, book.availableCopies + copiesDiff);
      }

      await booksCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateFields }
      );
      const updatedBook = await booksCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.json(updatedBook);
    } else {
      res.status(404);
      throw new Error('Book not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a book (soft delete)
// @route   DELETE /api/books/:id
// @access  Private
export const deleteBook = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    const trashesCollection = db.collection('trashes');
    const book = await booksCollection.findOne({ _id: new ObjectId(req.params.id), isDeleted: false });

    if (book) {
      // Soft delete
      await booksCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );

      // Add to trash
      await trashesCollection.insertOne({
        modelName: 'Book',
        documentId: book._id,
        documentData: book,
        deletedBy: req.staff?._id || null,
        deletedAt: new Date(),
      });

      res.json({ message: 'Book removed' });
    } else {
      res.status(404);
      throw new Error('Book not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Get book genres
// @route   GET /api/books/genres
// @access  Private
export const getBookGenres = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const booksCollection = db.collection('books');
    const genres = await booksCollection.distinct('genre', { isDeleted: false });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};