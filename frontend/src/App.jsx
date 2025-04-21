import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import page components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage'; // Import ReportsPage
import CustomersPage from './pages/CustomersPage'; // Import CustomersPage
import HistoryPage from './pages/HistoryPage'; // Import HistoryPage
import SettingsPage from './pages/SettingsPage'; // Import SettingsPage
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
// NOTE: AuthProvider integration is done in main.jsx

function App() {
  return (
    <Router>
      {/* No global div needed, layouts handle structure */}
      <Routes>
        {/* Authentication Routes with AuthLayout */}
        <Route
          path="/login"
          element={<AuthLayout><LoginPage /></AuthLayout>}
        />
        <Route
          path="/register"
          element={<AuthLayout><RegisterPage /></AuthLayout>}
        />

        {/* Protected Dashboard Routes with DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
         {/* Other Protected Routes */}
         <Route path="/reports" element={<ProtectedRoute><DashboardLayout><ReportsPage /></DashboardLayout></ProtectedRoute>} />
         <Route path="/customers" element={<ProtectedRoute><DashboardLayout><CustomersPage /></DashboardLayout></ProtectedRoute>} />
         <Route path="/history" element={<ProtectedRoute><DashboardLayout><HistoryPage /></DashboardLayout></ProtectedRoute>} />
         <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
        {/* Example:
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage /> // Assuming ProfilePage exists
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        */}

        {/* Default route redirects to login (or dashboard if logged in - handled by ProtectedRoute potentially) */}
        <Route path="/" element={<Navigate replace to="/login" />} />

        {/* Consider adding a 404 Not Found page later */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
