import React, { useState } from 'react';

const VIPCustomersAnalytics = ({ data }) => {
  if (!data || typeof data !== 'object' || !Array.isArray(data.vip_customers) || data.vip_customers.length === 0) {
    return <div className="text-center text-gray-400 py-10 italic text-lg">No VIP customer analytics available.</div>;
  }
  const vip_customers = data.vip_customers;
  // Calculate summary stats if needed
  const vip_count = vip_customers.length;
  const loyalty_points = vip_customers.reduce((sum, v) => sum + (v.loyalty_points || 0), 0);
  const revenue_share = 0; // Placeholder, calculate if needed
  const top_vips = vip_customers.slice(0, 20);
  const [activeTab, setActiveTab] = useState('vips');
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-xs uppercase">Total VIP Customers</span>
          <span className="text-2xl font-bold text-indigo-700">{vip_count}</span>
          <span className="text-xs text-gray-400 mt-1">Sample Data</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-xs uppercase">Total Loyalty Points</span>
          <span className="text-2xl font-bold text-indigo-700">{loyalty_points.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-xs uppercase">VIP Revenue Share</span>
          <span className="text-2xl font-bold text-green-700">{revenue_share}%</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button className={`px-4 py-2 font-medium ${activeTab === 'vips' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500'}`} onClick={() => setActiveTab('vips')}>VIP Customers</button>
        <button className={`px-4 py-2 font-medium ${activeTab === 'spending' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500'}`} onClick={() => setActiveTab('spending')}>Spending Patterns</button>
        <button className={`px-4 py-2 font-medium ${activeTab === 'loyalty' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500'}`} onClick={() => setActiveTab('loyalty')}>Loyalty Program</button>
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === 'vips' && (
          <div>
            <h4 className="font-semibold mb-2">Top VIP Customers</h4>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg mb-4">
              <table className="min-w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 rounded-t-xl">
                  <tr>
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">Customer ID</th>
                    <th className="px-4 py-2">Total Spent</th>
                    <th className="px-4 py-2">Loyalty Points</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {top_vips.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-gray-400 py-4">No VIP customers found.</td></tr>
                  ) : (
                    top_vips.map((row, idx) => (
                      <tr key={row.customer_id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 font-semibold">{idx + 1}</td>
                        <td className="px-4 py-2">{row.customer_id}</td>
                        <td className="px-4 py-2">${Number(row.total_paid || row.total_spent || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-4 py-2">{row.loyalty_points ?? 0}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            row.status === 'VIP'
                              ? 'bg-purple-100 text-purple-700'
                              : row.status === 'Loyal Customer'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}>
                            {row.status ?? ''}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* VIP Growth and Status Breakdown Charts (Placeholder) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <span className="font-semibold mb-2">VIP Customer Growth</span>
                <div className="w-full h-40 flex items-center justify-center text-gray-400">[Monthly VIP Growth Chart]</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <span className="font-semibold mb-2">VIP Status Distribution</span>
                <div className="w-full h-40 flex items-center justify-center text-gray-400">[Status Breakdown Pie Chart]</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'spending' && (
          <div>
            <h4 className="font-semibold mb-2">Spending Patterns</h4>
            <div className="text-gray-500">Coming soon...</div>
          </div>
        )}
        {activeTab === 'loyalty' && (
          <div>
            <h4 className="font-semibold mb-2">Loyalty Program</h4>
            <div className="text-gray-500">Coming soon...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VIPCustomersAnalytics;
