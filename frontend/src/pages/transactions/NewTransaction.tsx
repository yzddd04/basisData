import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

interface Book {
  _id: string;
  title: string;
  availableCopies: number;
}

interface Member {
  _id: string;
  name: string;
}

interface TransactionFormData {
  bookId: string;
  memberId: string;
  borrowDate: string;
  dueDate: string;
}

const NewTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState<TransactionFormData>({
    bookId: '',
    memberId: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch books
        const booksRes = await api.get('/books', { params: { limit: 1000 } });
        const booksData: Book[] = booksRes.data.books.filter((b: Book) => b.availableCopies > 0);
        setBooks(booksData);
        // Fetch members
        const membersRes = await api.get('/members', { params: { limit: 1000 } });
        setMembers(membersRes.data.members);
        setLoading(false);
      } catch {
        toast.error('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/transactions', {
        bookId: formData.bookId,
        memberId: formData.memberId,
        dueDate: formData.dueDate,
      });
      toast.success('Transaction created successfully');
      navigate('/transactions');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold">New Transaction</h1>

        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label htmlFor="bookId" className="block text-sm font-medium text-gray-700">
                Book
              </label>
              <select
                id="bookId"
                name="bookId"
                value={formData.bookId}
                onChange={handleChange}
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a book</option>
                {books.map(book => (
                  <option key={book._id} value={book._id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">
                Member
              </label>
              <select
                id="memberId"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a member</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="borrowDate" className="block text-sm font-medium text-gray-700">
                Borrow Date
              </label>
              <input
                type="date"
                id="borrowDate"
                name="borrowDate"
                value={formData.borrowDate}
                onChange={handleChange}
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTransaction; 