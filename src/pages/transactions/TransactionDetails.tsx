import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  bookTitle: string;
  bookId: string;
  memberName: string;
  memberId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fine?: number;
}

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        // TODO: Replace with actual API call
        // Simulated data for now
        const mockTransaction: Transaction = {
          id: id || '1',
          bookTitle: 'The Great Gatsby',
          bookId: '1',
          memberName: 'John Doe',
          memberId: '1',
          borrowDate: '2024-03-20',
          dueDate: '2024-04-20',
          status: 'borrowed'
        };
        setTransaction(mockTransaction);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch transaction details');
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const handleReturn = async () => {
    if (window.confirm('Are you sure you want to mark this book as returned?')) {
      try {
        // TODO: Replace with actual API call
        toast.success('Book returned successfully');
        navigate('/transactions');
      } catch (error) {
        toast.error('Failed to return book');
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!transaction) {
    return <div className="py-8 text-center">Transaction not found</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Transaction Details</h1>
          {transaction.status === 'borrowed' && (
            <button
              onClick={handleReturn}
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
              Mark as Returned
            </button>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Book</h3>
              <p className="mt-1">{transaction.bookTitle}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Member</h3>
              <p className="mt-1">{transaction.memberName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Borrow Date</h3>
              <p className="mt-1">{transaction.borrowDate}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
              <p className="mt-1">{transaction.dueDate}</p>
            </div>
            {transaction.returnDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Return Date</h3>
                <p className="mt-1">{transaction.returnDate}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1 capitalize">{transaction.status}</p>
            </div>
            {transaction.fine && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fine</h3>
                <p className="mt-1">${transaction.fine.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails; 