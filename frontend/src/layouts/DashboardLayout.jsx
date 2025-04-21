import React from 'react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle'; // Import ThemeToggle

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64"> {/* Add ml-64 to offset fixed sidebar */}
        {/* Optional Header can go here */}
        {/* <header className="bg-white shadow-sm p-4">Header Content</header> */}

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {/* The children (DashboardPage, ProfilePage, etc.) will be rendered here */}
          {children}
        </main>

        {/* Theme Toggle Button */}
        <ThemeToggle />
      </div>
    </div>
  );
};

export default DashboardLayout;
