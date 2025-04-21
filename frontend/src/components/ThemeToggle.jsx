import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Placeholder Icons (replace with actual icons if desired)
const SunIcon = () => <span>☀️</span>;
const MoonIcon = () => <span>🌙</span>;

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-5 right-5 z-50 p-2 rounded-full bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 shadow-lg hover:bg-gray-600 dark:hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

export default ThemeToggle;
