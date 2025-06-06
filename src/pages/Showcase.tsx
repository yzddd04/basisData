import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  coverImage: string;
  description: string;
  copies: number;
  availableCopies: number;
}

const Showcase: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, [page, search, genre]);

  const fetchBooks = async () => {
    try {
      const { data } = await api.get('/books', {
        params: {
          page,
          search,
          genre,
          limit: 12,
        },
      });
      setBooks(data.books);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const { data } = await api.get('/books/genres');
      setGenres(data);
    } catch (error) {
      console.error('Failed to fetch genres:', error);
    }
  };

  const openBookDetail = (book: Book) => {
    setSelectedBook(book);
  };

  const closeBookDetail = () => {
    setSelectedBook(null);
  };

  const handleBorrowClick = (bookId: string) => {
    if (!user) {
      toast.error('Please login to borrow books');
      navigate('/login');
      return;
    }
    navigate(`/dashboard/transactions/new?bookId=${bookId}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ backgroundColor: 'white' }}>
      <header className="bg-black shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white drop-shadow">Digital Library</h1>
            <div className="flex space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Explore Our Collection
        </h2>

        {/* Filters */}
        <div className="bg-gray-100 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  placeholder="Search by title, author, or ISBN"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <div className="relative">
                <select
                  id="genre"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option value="">All Genres</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                  onClick={() => openBookDetail(book)}
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{book.author}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                        {book.genre}
                      </span>
                      <span className="text-sm text-gray-500">
                        {book.availableCopies}/{book.copies} available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        page === i + 1
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">
              {search || genre
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'The library is currently empty.'}
            </p>
          </div>
        )}
      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={closeBookDetail}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="aspect-[3/4] relative rounded-xl overflow-hidden">
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedBook.title}</h2>
                    <p className="text-xl text-gray-600 mb-6">{selectedBook.author}</p>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                        <p className="text-gray-900">{selectedBook.isbn}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                        <p className="text-gray-900">{selectedBook.genre}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Availability</h3>
                        <p className="text-gray-900">
                          {selectedBook.availableCopies} of {selectedBook.copies} copies available
                        </p>
                      </div>
                    </div>
                    {selectedBook.availableCopies > 0 && (
                      <div className="mt-8">
                        <button
                          onClick={() => handleBorrowClick(selectedBook._id)}
                          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Borrow Book
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase; 