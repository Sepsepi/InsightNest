import React from 'react';

const AvgOrderValueAnalytics = ({ data }) => {
  if (!data || typeof data !== 'object' || typeof data.value !== 'number' || isNaN(data.value)) {
    return <div className="text-center text-gray-400 py-10 italic text-lg">No average order value analytics available.</div>;
  }
  const value = data.value;
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-2">Average Order Value</h3>
      <div className="text-2xl font-bold text-purple-700">${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
      <div className="text-gray-500 text-sm">Calculated as total revenue divided by total number of orders.</div>
    </div>
  );
};

export default AvgOrderValueAnalytics;
