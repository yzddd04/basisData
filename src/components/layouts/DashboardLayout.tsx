import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, Users, RepeatIcon, UserCog, BarChart3, Trash2, 
  Menu, X, LogOut, Home, ChevronDown, BellIcon 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Demo notifications
  const notifications = [
    { id: 1, message: "5 books are overdue today", time: "10 min ago" },
    { id: 2, message: "New member registered", time: "1 hour ago" },
    { id: 3, message: "Monthly report is ready", time: "3 hours ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-primary-950 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-primary-800">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-xl font-bold">LibraryMS</h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-primary-800 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/') ? 'bg-primary-800 text-white' : 'text-gray-300 hover:bg-primary-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/books"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/books') ? 'bg-primary-800 text-white' : 'text-gray-300 hover:bg-primary-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Books
              </Link>
            </li>
            <li>
              <Link
                to="/members"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/members') ? 'bg-primary-800 text-white' : 'text-gray-300 hover:bg-primary-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="h-5 w-5 mr-3" />
                Members
              </Link>
            </li>
            <li>
              <Link
                to="/transactions"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/transactions') ? 'bg-primary-800 text-white' : 'text-gray-300 hover:bg-primary-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <RepeatIcon className="h-5 w-5 mr-3" />
                Transactions
              </Link>
            </li>
            <li>
              <Link
                to="/reports"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/reports') ? 'bg-primary-800 text-white' : 'text-gray-300 hover:bg-primary-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Reports
              </Link>
            </li>
            
            {isAdmin() && (
              <>
                <li>
                  <Link
                    to="/staff"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive('/staff') ? 'bg-primary-800 text-white' : 'text-gray-300 hover:bg-primary-900 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <UserCog className="h-5 w-5 mr-3" />
                    Staff
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trash"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive('/trash') ? 'bg-primary-800 text-white' : 'text-gray-300 hover:bg-primary-900 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Trash2 className="h-5 w-5 mr-3" />
                    Trash
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 fixed top-0 right-0 left-0 z-10 lg:left-64">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-1 rounded-full hover:bg-gray-100 relative"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 left-auto mt-2 min-w-[320px] w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 overflow-visible
                    sm:right-0 sm:left-auto
                    left-1/2 -translate-x-1/2 sm:translate-x-0
                  ">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* User profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                      {user?.name.charAt(0)}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                      {user?.name}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                  </div>
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 left-auto mt-2 min-w-[200px] w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 overflow-visible
                    sm:right-0 sm:left-auto
                    left-1/2 -translate-x-1/2 sm:translate-x-0
                  ">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs mt-1 bg-gray-100 rounded px-2 py-0.5 inline-block capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 pt-24 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;