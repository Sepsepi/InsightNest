import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To get user info and logout

// Placeholder icons (replace with actual icons later if needed)
const DashboardIcon = () => <span>📊</span>;
const ReportsIcon = () => <span>📄</span>;
const CustomersIcon = () => <span>👥</span>;
const HistoryIcon = () => <span>🕒</span>;
const ProfileIcon = () => <span>👤</span>;
const SettingsIcon = () => <span>⚙️</span>;
const LogoutIcon = () => <span>🚪</span>;

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation(); // To highlight active link

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { name: 'Reports', path: '/reports', icon: ReportsIcon }, // Add paths later
    { name: 'Customers', path: '/customers', icon: CustomersIcon },
    { name: 'History', path: '/history', icon: HistoryIcon },
    { name: 'Profile', path: '/profile', icon: ProfileIcon },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-gray-900 text-gray-300 flex flex-col fixed"> {/* Fixed position */}
      {/* Logo/Title */}
      <div className="p-4 text-center text-2xl font-bold text-white border-b border-gray-700">
        InsightsDash
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white ${
              isActive(item.path) ? 'bg-gray-800 text-white' : 'text-gray-400'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User Profile / Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold mr-3">
            {/* Placeholder initial */}
            {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
            <Link to="/profile" className="text-xs text-gray-400 hover:text-indigo-400">
              View Profile
            </Link>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          <LogoutIcon className="mr-3 h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
