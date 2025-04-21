import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading indicator while checking auth status
    // Avoid rendering children or redirecting until auth check is complete
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div>Loading authentication...</div>
        </div>
    );
  }

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    // Pass the current location state so we can redirect back after login (optional)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child component
  return children;
};

export default ProtectedRoute;
