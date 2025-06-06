import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import { RefreshProvider } from './contexts/RefreshContext';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/Dashboard';

// Book Pages
import Books from './pages/books/Books';
import BookDetails from './pages/books/BookDetails';
import AddBook from './pages/books/AddBook';
import EditBook from './pages/books/EditBook';
import Showcase from './pages/Showcase';

// Member Pages
import Members from './pages/members/Members';
import MemberDetails from './pages/members/MemberDetails';
import AddMember from './pages/members/AddMember';
import EditMember from './pages/members/EditMember';

// Transaction Pages
import Transactions from './pages/transactions/Transactions';
import TransactionDetails from './pages/transactions/TransactionDetails';
import NewTransaction from './pages/transactions/NewTransaction';

// Staff Pages
import Staff from './pages/staff/Staff';
import StaffDetails from './pages/staff/StaffDetails';
import AddStaff from './pages/staff/AddStaff';
import EditStaff from './pages/staff/EditStaff';

// Report Pages
import Reports from './pages/reports/Reports';
import OverdueReport from './pages/reports/OverdueReport';

// Trash Pages
import Trash from './pages/trash/Trash';

function App() {
  return (
    <AuthProvider>
      <RefreshProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Showcase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              
              {/* Book Routes */}
              <Route path="books" element={<Books />} />
              <Route path="books/add" element={<AddBook />} />
              <Route path="books/:id" element={<BookDetails />} />
              <Route path="books/:id/edit" element={<EditBook />} />
              
              {/* Member Routes */}
              <Route path="members" element={<Members />} />
              <Route path="members/add" element={<AddMember />} />
              <Route path="members/:id" element={<MemberDetails />} />
              <Route path="members/:id/edit" element={<EditMember />} />
              
              {/* Transaction Routes */}
              <Route path="transactions" element={<Transactions />} />
              <Route path="transactions/new" element={<NewTransaction />} />
              <Route path="transactions/:id" element={<TransactionDetails />} />
              
              {/* Report Routes */}
              <Route path="reports" element={<Reports />} />
              <Route path="reports/overdue" element={<OverdueReport />} />
              
              {/* Admin Routes */}
              <Route path="staff" element={<AdminRoute><Staff /></AdminRoute>} />
              <Route path="staff/add" element={<AdminRoute><AddStaff /></AdminRoute>} />
              <Route path="staff/:id" element={<AdminRoute><StaffDetails /></AdminRoute>} />
              <Route path="staff/:id/edit" element={<AdminRoute><EditStaff /></AdminRoute>} />
              
              {/* Trash Routes */}
              <Route path="trash" element={<AdminRoute><Trash /></AdminRoute>} />
            </Route>
          </Routes>
        </Router>
      </RefreshProvider>
    </AuthProvider>
  );
}

export default App;