import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, BookOpen } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  genre: string;
  description: string;
  coverImage: string;
  copies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt: string;
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (error) {
      toast.error('Failed to fetch book details');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.delete(`/books/${id}`);
      toast.success('Book deleted successfully');
      navigate('/books');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete book');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Books
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
            <p className="mt-1 text-sm text-gray-500">Book Details</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/books/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-5 sm:p-6">
            <div className="md:col-span-1">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Author</h3>
                  <p className="mt-1 text-sm text-gray-900">{book.author}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                  <p className="mt-1 text-sm text-gray-900">{book.isbn}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Publisher</h3>
                  <p className="mt-1 text-sm text-gray-900">{book.publisher}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Publication Year</h3>
                  <p className="mt-1 text-sm text-gray-900">{book.publicationYear}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                  <p className="mt-1 text-sm text-gray-900">{book.genre}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Availability</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {book.availableCopies} of {book.copies} copies available
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-sm text-gray-900">{book.description || 'No description available.'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Added On</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(book.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {book.availableCopies > 0 && (
                <div className="pt-4">
                  <Link
                    to={`/transactions/new?bookId=${book._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Issue Book
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;