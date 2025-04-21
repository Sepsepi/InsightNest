import React, { useState, useEffect } from 'react'; // Import useEffect
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../context/AuthContext'; // Import useAuth

const LoginPage = () => {
  const location = useLocation(); // Get location object
  const [message, setMessage] = useState(''); // State for the message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [showPassword, setShowPassword] = useState(false); // Add showPassword state
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  // Check for message from registration redirect
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Optional: Clear the state so message doesn't reappear on back navigation
      // navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]); // Run only when location state changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading true

    if (!username || !password) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }

    try {
      await login(username, password); // Call actual login function from useAuth
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err) {
      // Attempt to parse backend error message if available
      let errorMessage = 'Failed to log in. Please check your credentials.';
      // DRF Token Auth typically returns non_field_errors for bad credentials
      if (err.response && err.response.data && err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(' ');
      } else if (err.message) {
          // Handle cases where error might be a stringified JSON from apiService
          try {
              const parsedError = JSON.parse(err.message);
              errorMessage = Object.values(parsedError).flat().join(' ');
          } catch (parseError) {
              // Fallback if parsing fails or it's a different error structure
              errorMessage = err.message || errorMessage;
          }
      }
      setError(errorMessage);
      console.error("Login error:", err.response || err); // Log the full error or response
    } finally {
      setLoading(false); // Set loading false regardless of outcome
    }
  };

  // Note: The outer centering div is removed as AuthLayout handles it.
  return (
    // Container matching the screenshot style
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

      {/* Header */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">Customer Insights Dashboard</h2>
      <p className="text-gray-600 mb-6">Sign in to your account or create a new one</p>

      {/* Tabs (Visual Only for now) */}
      <div className="flex border-b mb-6">
        <button className="flex-1 py-2 text-center text-blue-600 border-b-2 border-blue-600 font-semibold">
          Login
        </button>
        <Link to="/register" className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700">
          Register
        </Link>
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
          {/* Placeholder Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="font-semibold text-gray-700">Welcome back!</p>
        <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
      </div>

      {/* Display success message from registration */}
      {message && <p className="text-green-600 bg-green-100 border border-green-400 px-4 py-2 rounded text-center mb-4 text-sm">{message}</p>}
      {/* Display login error message */}
      {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
            {/* Remove duplicated input tag below */}
            <input
              type="text"
              placeholder="Enter your username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
            />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.062 2.675A10.05 10.05 0 0112 5c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.062-2.675A10.05 10.05 0 0112 19c-1.657 0-3.234-.336-4.675-.938m2.675-2.062A10.05 10.05 0 0112 5c1.657 0 3.234.336 4.675.938m-2.675 2.062A10.05 10.05 0 0112 19c-1.657 0-3.234-.336-4.675-.938" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.599 4.8A9.956 9.956 0 0112 3c2.21 0 4.26.715 5.899 1.8M21 21l-6-6" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="remember-me" className="ml-2 block text-gray-900"> Remember me </label>
          </div>
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500"> Forgot Password? </a>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
