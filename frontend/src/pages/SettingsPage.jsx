import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme(); // Get theme state and toggle function

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* Remove Appearance Section */}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">API Keys</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your API keys here (e.g., for Gemini AI).</p>
        {/* Placeholder for API key management */}
      </div>
    </div>
  );
};

export default SettingsPage;
