import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { useRefresh } from '../../contexts/RefreshContext';

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  genre: string;
  description: string;
  coverImage: string;
  copies: number;
}

const AddBook: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    genre: '',
    description: '',
    coverImage: '',
    copies: 1,
  });
  const { refreshBooks } = useRefresh();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'publicationYear' || name === 'copies' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await api.post('/books', formData);
      toast.success('Book added successfully');
      refreshBooks();
      navigate('/dashboard/books');
    } catch (error: AxiosError | Error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
         toast.error(error.message);
      } else {
        toast.error('Failed to add book');
      }
      console.error('Failed to add book:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Add New Book</h1>
          <p className="text-gray-500">Add a new book to your library collection</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="max-w-3xl px-4 py-5 mx-auto sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="author"
                    id="author"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                  ISBN *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="isbn"
                    id="isbn"
                    required
                    value={formData.isbn}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
                  Publisher *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="publisher"
                    id="publisher"
                    required
                    value={formData.publisher}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700">
                  Publication Year *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="publicationYear"
                    id="publicationYear"
                    required
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.publicationYear}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                  Genre *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="genre"
                    id="genre"
                    required
                    value={formData.genre}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                  Cover Image URL
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="coverImage"
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="https://example.com/book-cover.jpg"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="copies" className="block text-sm font-medium text-gray-700">
                  Number of Copies *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="copies"
                    id="copies"
                    required
                    min="1"
                    value={formData.copies}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/books')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    Adding Book...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5 mr-2" />
                    Add Book
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBook;