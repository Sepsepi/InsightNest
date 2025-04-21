import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        {user ? (
          <div className="space-y-2">
            <p><span className="font-medium">Username:</span> {user.username}</p>
            <p><span className="font-medium">Email:</span> {user.email || 'Not available'}</p>
            {/* Add more user details here if available/needed */}
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>

       <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <p className="text-gray-600">Profile settings options can be added here (e.g., change password, update email).</p>
        {/* Add form elements for settings later */}
      </div>
    </div>
  );
};

export default ProfilePage;
