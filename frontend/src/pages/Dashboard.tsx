import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, RepeatIcon, AlertTriangle, TrendingUp, BookMarked } from 'lucide-react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalMembers: 0,
    activeTransactions: 0,
    overdueBooks: 0,
  });
  
  const [popularBooks, setPopularBooks] = useState([]);
  const [activeBorrowers, setActiveBorrowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch all books
        const booksRes = await api.get('/books', { params: { limit: 9999 } });
        const books = booksRes.data.books || [];
        const totalBooks = books.reduce((sum, b) => sum + (b.copies || 0), 0);
        const availableBooks = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
        // Fetch member count
        const membersRes = await api.get('/members', { params: { limit: 1 } });
        const totalMembers = membersRes.data.total;
        // Fetch active transactions count
        const activeTransactionsRes = await api.get('/transactions', { params: { status: 'borrowed', limit: 1 } });
        const activeTransactions = activeTransactionsRes.data.total;
        // Fetch overdue books count
        const overdueRes = await api.get('/transactions', { params: { status: 'overdue', limit: 1 } });
        const overdueBooks = overdueRes.data.total;
        // Fetch popular books
        const popularBooksRes = await api.get('/reports/popular-books', { params: { period: 'month', limit: 5 } });
        // Fetch active borrowers
        const activeBorrowersRes = await api.get('/reports/active-borrowers', { params: { period: 'month', limit: 5 } });
        setStats({
          totalBooks,
          availableBooks,
          totalMembers,
          activeTransactions,
          overdueBooks,
        });
        setPopularBooks(popularBooksRes.data);
        setActiveBorrowers(activeBorrowersRes.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Prepare chart data
  const bookStatusData = {
    labels: ['Borrowed', 'Available'],
    datasets: [
      {
        data: [stats.totalBooks - stats.availableBooks, stats.availableBooks],
        backgroundColor: ['#F59E0B', '#10B981'],
        borderColor: ['#F59E0B', '#10B981'],
        borderWidth: 1,
      },
    ],
  };

  const transactionData = {
    labels: popularBooks.slice(0, 5).map((book: any) => book.title),
    datasets: [
      {
        label: 'Borrow Count',
        data: popularBooks.slice(0, 5).map((book: any) => book.borrowCount),
        backgroundColor: '#1E40AF',
      },
    ],
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to the Library Management System</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 text-primary-800 mr-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Books</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalBooks}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/dashboard/books" className="text-sm text-primary-600 hover:text-primary-800">
                  View all books
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-600 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-teal-100 text-teal-800 mr-4">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/dashboard/members" className="text-sm text-teal-600 hover:text-teal-800">
                  View all members
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-600 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-800 mr-4">
                  <RepeatIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Borrowings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeTransactions}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/dashboard/transactions" className="text-sm text-amber-600 hover:text-amber-800">
                  View all transactions
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-800 mr-4">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.overdueBooks}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/dashboard/reports/overdue" className="text-sm text-red-600 hover:text-red-800">
                  View overdue books
                </Link>
              </div>
            </div>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Book Status Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Book Status</h2>
              <div className="h-64 flex items-center justify-center">
                <Pie data={bookStatusData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Popular Books Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Popular Books (This Month)</h2>
              <div className="h-64">
                <Bar 
                  data={transactionData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }} 
                />
              </div>
            </div>

            {/* Popular Books Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center">
                <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-semibold">Popular Books</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Borrows</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {popularBooks.length > 0 ? (
                      popularBooks.map((book: any) => (
                        <tr key={book._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-md object-cover" src={book.coverImage} alt={book.title} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                <div className="text-sm text-gray-500">ISBN: {book.isbn}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.genre}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{book.borrowCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Borrowers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center">
                <BookMarked className="h-5 w-5 text-teal-600 mr-2" />
                <h2 className="text-lg font-semibold">Active Borrowers</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Books Borrowed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeBorrowers.length > 0 ? (
                      activeBorrowers.map((borrower: any) => (
                        <tr key={borrower._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{borrower.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{borrower.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(borrower.membershipDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{borrower.borrowCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/dashboard/transactions/new"
                className="bg-primary-50 hover:bg-primary-100 p-4 rounded-lg border border-primary-200 flex items-center justify-between transition"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-3">
                    <RepeatIcon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-primary-700">Issue Book</span>
                </div>
                <span className="text-primary-600">&rarr;</span>
              </Link>
              
              <Link
                to="/dashboard/books/add"
                className="bg-teal-50 hover:bg-teal-100 p-4 rounded-lg border border-teal-200 flex items-center justify-between transition"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-teal-100 text-teal-600 mr-3">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-teal-700">Add New Book</span>
                </div>
                <span className="text-teal-600">&rarr;</span>
              </Link>
              
              <Link
                to="/dashboard/members/add"
                className="bg-amber-50 hover:bg-amber-100 p-4 rounded-lg border border-amber-200 flex items-center justify-between transition"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-3">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-amber-700">Add New Member</span>
                </div>
                <span className="text-amber-600">&rarr;</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;