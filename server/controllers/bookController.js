import Book from '../models/bookModel.js';
import Trash from '../models/trashModel.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Private
export const getBooks = async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by genre
    if (genre) {
      query.genre = genre;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const books = await Book.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
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
    const book = await Book.findOne({ _id: req.params.id, isDeleted: false });

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

    // Check if book with ISBN already exists
    const bookExists = await Book.findOne({ isbn, isDeleted: false });

    if (bookExists) {
      res.status(400);
      throw new Error('Book with this ISBN already exists');
    }

    const book = await Book.create({
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
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isDeleted: false });

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
        const bookWithIsbn = await Book.findOne({ isbn, isDeleted: false });
        if (bookWithIsbn) {
          res.status(400);
          throw new Error('Book with this ISBN already exists');
        }
      }

      // Update fields
      book.title = title || book.title;
      book.author = author || book.author;
      book.isbn = isbn || book.isbn;
      book.publisher = publisher || book.publisher;
      book.publicationYear = publicationYear || book.publicationYear;
      book.genre = genre || book.genre;
      book.description = description || book.description;
      book.coverImage = coverImage || book.coverImage;

      // Handle copies update
      if (copies !== undefined) {
        const copiesDiff = copies - book.copies;
        book.copies = copies;
        book.availableCopies = Math.max(0, book.availableCopies + copiesDiff);
      }

      const updatedBook = await book.save();
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
    const book = await Book.findOne({ _id: req.params.id, isDeleted: false });

    if (book) {
      // Soft delete
      book.isDeleted = true;
      book.deletedAt = Date.now();
      await book.save();

      // Add to trash
      await Trash.create({
        modelName: 'Book',
        documentId: book._id,
        documentData: book.toObject(),
        deletedBy: req.staff._id,
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
    const genres = await Book.distinct('genre', { isDeleted: false });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};