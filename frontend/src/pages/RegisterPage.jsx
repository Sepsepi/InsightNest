import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const { register } = useAuth(); // Get register function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (password !== password2) {
      setError('Passwords do not match.');
      setLoading(false); // Also set loading false if passwords don't match
      return;
    }

    setLoading(true); // Set loading true

    try {
      await register(username, email, password, password2); // Call actual register function
      // Redirect to login page with a success message state
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      // Attempt to parse backend error message (often field-specific for registration)
      let errorMessage = 'Failed to register. Please try again.';
       if (err.message) {
          try {
              // Errors from apiService might be stringified JSON
              const parsedError = JSON.parse(err.message);
              // Combine all error messages from the backend response
              errorMessage = Object.entries(parsedError)
                  .map(([field, messages]) => `${field}: ${messages.join(' ')}`)
                  .join('; ');
          } catch (parseError) {
               errorMessage = err.message || errorMessage; // Fallback if not JSON
          }
       } else if (err.response && err.response.data) {
           // Fallback for other potential error structures
           errorMessage = JSON.stringify(err.response.data);
       }
      setError(errorMessage);
      console.error("Registration error:", err.response || err);
    } finally {
      setLoading(false); // Set loading false
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
         <Link to="/login" className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700">
          Login
        </Link>
        <button className="flex-1 py-2 text-center text-blue-600 border-b-2 border-blue-600 font-semibold">
          Register
        </button>
      </div>

       <h3 className="text-xl font-semibold text-center text-gray-700 mb-6">Create your account</h3>
        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
            {/* Remove duplicated input tag below */}
            <input
              type="text"
              placeholder="Choose a username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            {/* Remove duplicated input tag below */}
            <input
              type="email"
              placeholder="Enter your email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            {/* Remove duplicated input tag below */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password2">Confirm Password</label>
            {/* Remove duplicated input tag below */}
            <div className="relative">
              <input
                type={showPassword2 ? "text" : "password"}
                placeholder="Confirm your password"
                id="password2"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 focus:outline-none"
                onClick={() => setShowPassword2((prev) => !prev)}
              >
                {showPassword2 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.062 2.675A10.05 10.05 0 0112 5c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.062-2.675A10.05 10.05 0 0112 19c-1.657 0-3.234-.336-4.675-.938m2.675-2.062A10.05 10.05 0 0112 5c1.657 0 3.234.336 4.675.938m-2.675 2.062A10.05 10.05 0 0112 19c-1.657 0-3.234-.336-4.675-.938" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.599 4.8A9.956 9.956 0 0112 3c2.21 0 4.26.715 5.899 1.8M21 21l-6-6" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
           <div className="pt-2"> {/* Add some padding top */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

           {/* Link to Login */}
           <div className="text-sm text-center">
                <Link to="/login" className={`font-medium text-blue-600 hover:text-blue-500 ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                    Already have an account? Sign In
                </Link>
            </div>
        </form>
    </div>
  );
};

export default RegisterPage;
