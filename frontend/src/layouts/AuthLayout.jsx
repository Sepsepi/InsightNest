import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Side (Form Area) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        {/* The children (LoginPage or RegisterPage) will be rendered here */}
        {children}
      </div>

      {/* Right Side (Informational Panel - Inspired by Screenshot) */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex-col items-center justify-center p-12">
        <h1 className="text-4xl font-bold mb-4">AI-Powered Customer Insights Dashboard</h1>
        <p className="text-lg mb-6 text-indigo-100 text-center">
          Upload your customer transaction data and get powerful insights with RFM analysis and AI recommendations.
        </p>
        <ul className="list-disc list-inside space-y-2 text-indigo-100">
          <li>Upload CSV/Excel transaction data</li>
          <li>Interactive RFM segmentation</li>
          <li>AI-powered customer insights</li>
          <li>Visualize customer behavior</li>
        </ul>
        {/* Add logo or illustration later if desired */}
      </div>
    </div>
  );
};

export default AuthLayout;
