import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

interface ReportData {
  totalBooks: number;
  totalMembers: number;
  totalStaff: number;
  activeLoans: number;
  overdueLoans: number;
  recentTransactions: {
    id: string;
    type: 'borrow' | 'return';
    bookTitle: string;
    memberName: string;
    date: string;
  }[];
  popularBooks: {
    id: string;
    title: string;
    author: string;
    borrowCount: number;
  }[];
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Fetch total books
        const booksRes = await api.get('/books', { params: { limit: 1 } });
        const totalBooks = booksRes.data.total;
        // Fetch total members
        const membersRes = await api.get('/members', { params: { limit: 1 } });
        const totalMembers = membersRes.data.total;
        // Fetch total staff
        const staffRes = await api.get('/staff', { params: { limit: 1 } });
        const totalStaff = staffRes.data.total;
        // Fetch active loans
        const activeLoansRes = await api.get('/transactions', { params: { status: 'borrowed', limit: 1 } });
        const activeLoans = activeLoansRes.data.total;
        // Fetch overdue loans
        const overdueLoansRes = await api.get('/transactions', { params: { status: 'overdue', limit: 1 } });
        const overdueLoans = overdueLoansRes.data.total;
        // Fetch recent transactions (limit 10, sorted by issueDate desc)
        const recentTransRes = await api.get('/transactions', { params: { limit: 10 } });
        const recentTransactions = recentTransRes.data.transactions.map((t: {
          _id: string;
          status: string;
          book?: { title?: string };
          member?: { name?: string };
          issueDate?: string;
        }) => ({
          id: t._id,
          type: t.status === 'returned' ? 'return' : 'borrow',
          bookTitle: t.book?.title || '-',
          memberName: t.member?.name || '-',
          date: t.issueDate ? new Date(t.issueDate).toLocaleDateString() : '-',
        }));
        // Fetch popular books
        const popularBooksRes = await api.get('/reports/popular-books', { params: { period: 'month', limit: 10 } });
        const popularBooks = popularBooksRes.data.map((b: {
          _id: string;
          title: string;
          author: string;
          borrowCount: number;
        }) => ({
          id: b._id,
          title: b.title,
          author: b.author,
          borrowCount: b.borrowCount,
        }));
        setReportData({
          totalBooks,
          totalMembers,
          totalStaff,
          activeLoans,
          overdueLoans,
          recentTransactions,
          popularBooks,
        });
        setLoading(false);
      } catch {
        toast.error('Failed to fetch report data');
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!reportData) {
    return <div className="text-center text-red-500">Failed to load report data</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Library Reports</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-2 text-lg font-medium text-gray-900">Total Books</h3>
          <p className="text-3xl font-bold text-blue-600">{reportData.totalBooks}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-2 text-lg font-medium text-gray-900">Total Members</h3>
          <p className="text-3xl font-bold text-green-600">{reportData.totalMembers}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-2 text-lg font-medium text-gray-900">Total Staff</h3>
          <p className="text-3xl font-bold text-purple-600">{reportData.totalStaff}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-2 text-lg font-medium text-gray-900">Active Loans</h3>
          <p className="text-3xl font-bold text-yellow-600">{reportData.activeLoans}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-2 text-lg font-medium text-gray-900">Overdue Loans</h3>
          <p className="text-3xl font-bold text-red-600">{reportData.overdueLoans}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Book</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'borrow' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type === 'borrow' ? 'Borrow' : 'Return'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.bookTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.memberName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Books */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Popular Books</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Borrow Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.popularBooks.map((book) => (
                <tr key={book.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{book.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.borrowCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports; 