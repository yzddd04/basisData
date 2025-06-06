import React, { useState, useRef, useEffect } from 'react';
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

  // Tambah ref untuk pop-up
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close pop-up jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsOpen && notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (notificationsOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen, profileOpen]);

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
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-black text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-xl font-bold text-white">LibraryMS</h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-gray-800 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/') ? 'bg-white text-black' : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/books"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/books') ? 'bg-white text-black' : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Books
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/members"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/members') ? 'bg-white text-black' : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="h-5 w-5 mr-3" />
                Members
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/transactions"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/transactions') ? 'bg-white text-black' : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <RepeatIcon className="h-5 w-5 mr-3" />
                Transactions
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/reports"
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive('/reports') ? 'bg-white text-black' : 'text-white hover:bg-gray-900 hover:text-white'
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
                    to="/dashboard/staff"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive('/staff') ? 'bg-white text-black' : 'text-white hover:bg-gray-900 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <UserCog className="h-5 w-5 mr-3" />
                    Staff
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/trash"
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive('/trash') ? 'bg-white text-black' : 'text-white hover:bg-gray-900 hover:text-white'
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
          <div className="flex items-center h-full px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          {/* Profile & Notification fixed at top right */}
          <div className="fixed top-4 right-8 z-50 flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1 rounded-full hover:bg-gray-100 relative"
              >
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 left-auto mt-2 min-w-[320px] w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 overflow-visible transition-none">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-0"
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-black hover:text-gray-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* User profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="ml-2 text-sm font-medium text-black hidden md:block">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 left-auto mt-2 min-w-[200px] w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 overflow-visible transition-none">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs mt-1 bg-gray-100 rounded px-2 py-0.5 inline-block capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-black hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
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