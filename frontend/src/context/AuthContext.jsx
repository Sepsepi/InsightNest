import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService'; // Import our API service

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // For initial token check
  const [authInitialized, setAuthInitialized] = useState(false); // Track if initial user fetch is done

  // Function to fetch user details
  const fetchUserDetails = async () => {
    console.log("Attempting to fetch user details...");
    try {
      const userData = await apiService.getCurrentUserDetails();
      setUser(userData); // Set user state
      console.log("User details set:", userData);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      // If fetching fails (e.g., invalid token), log out
      setToken(null); // This will trigger the useEffect below to clear everything
    }
  };

  // Effect to set the token in apiService and fetch user details
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true); // Start loading for this effect
      if (token) {
        console.log("Token found, setting in API service and fetching user details.");
        apiService.setAuthToken(token);
        localStorage.setItem('authToken', token);
        await fetchUserDetails(); // Fetch details if token exists
      } else {
        console.log("No token found, clearing auth state.");
        apiService.setAuthToken(null);
        localStorage.removeItem('authToken');
        setUser(null); // Clear user if token is removed
      }
      setAuthInitialized(true); // Mark initial auth flow as complete
      setLoading(false); // Finish loading for this effect
    };
    initializeAuth();
  }, [token]); // Rerun when token changes

  // Login function
  const login = async (username, password) => {
    try {
      const data = await apiService.loginUser(username, password);
      if (data.token) {
        setToken(data.token); // Update token state, this triggers useEffect
        // Explicitly fetch user details AFTER token is set and useEffect runs
        // We might need a slight delay or better state management, but let's try fetching directly
        await fetchUserDetails(); // Fetch user details immediately after setting token
        return data; // Return response data
      } else {
         throw new Error("Login successful but no token received.");
      }
    } catch (error) {
      console.error("AuthContext login error:", error);
      // Rethrow the error so the component can handle UI feedback
      throw error;
    }
  };

  // Register function
  const register = async (username, email, password, password2) => {
     try {
        const data = await apiService.registerUser(username, email, password, password2);
        // Decide if registration should automatically log the user in
        if (data.token) {
            console.log("Registration successful, token received.");
            // setToken(data.token); // Uncomment to auto-login after register
            // setUser(data.user);
        }
        return data; // Return response data (might include user info)
     } catch (error) {
        console.error("AuthContext register error:", error);
        throw error; // Rethrow for component handling
     }
  };

  // Logout function
  const logout = () => {
    setToken(null); // Clear token state, useEffect handles the rest
    // Optionally call a backend logout endpoint if it exists (e.g., to invalidate token server-side)
    console.log("User logged out");
  };

  // Value provided to consuming components
  const value = {
    user,
    token,
    isAuthenticated: !!token, // Simple check if token exists
    loading, // Provide loading state for initial auth check
    login,
    register,
    logout,
    authInitialized, // Expose initialization status
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only after the initial auth flow is complete */}
      {authInitialized ? children : <div>Loading Authentication...</div>} {/* Or a spinner */}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
