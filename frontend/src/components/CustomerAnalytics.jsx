import React, { useState } from 'react';

const CustomerAnalytics = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <div className="text-center text-gray-400 py-10 italic text-lg">No customer analytics available.</div>;
  }
  if (!data) return <div>No customer analytics available.</div>;
  const { total_customers = 0, avg_lifetime = 0, avg_purchase_freq = 0, top_customers = [], segments = [], behavior = [] } = data;
  const [activeTab, setActiveTab] = useState('top');
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-xs uppercase">Total Individual Customers</span>
          <span className="text-2xl font-bold text-indigo-700">{total_customers}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-xs uppercase">Average Customer Lifetime</span>
          <span className="text-2xl font-bold text-indigo-700">{avg_lifetime} days</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-xs uppercase">Average Purchase Frequency</span>
          <span className="text-2xl font-bold text-indigo-700">{avg_purchase_freq} orders</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button className={`px-4 py-2 font-medium ${activeTab === 'top' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500'}`} onClick={() => setActiveTab('top')}>Top Customers</button>
        <button className={`px-4 py-2 font-medium ${activeTab === 'segments' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500'}`} onClick={() => setActiveTab('segments')}>Customer Segments</button>
        <button className={`px-4 py-2 font-medium ${activeTab === 'behavior' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500'}`} onClick={() => setActiveTab('behavior')}>Customer Behavior</button>
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === 'top' && (
          <div>
            <h4 className="font-semibold mb-2">Top 20 Customers by Value & Loyalty</h4>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
              <table className="min-w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 rounded-t-xl">
                  <tr>
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">Customer ID</th>
                    <th className="px-4 py-2">Time With Us</th>
                    <th className="px-4 py-2">Total Spent</th>
                    <th className="px-4 py-2">Transactions</th>
                    <th className="px-4 py-2">Last Purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {top_customers.slice(0, 20).map((c, idx) => (
                    <tr key={c.customer_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-semibold">{idx + 1}</td>
                      <td className="px-4 py-2">{c.customer_id}</td>
                      <td className="px-4 py-2">{c.time_with_us}</td>
                      <td className="px-4 py-2">${Number(c.total_spent).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-2">{c.transactions}</td>
                      <td className="px-4 py-2">{c.last_purchase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'segments' && (
          <div>
            <h4 className="font-semibold mb-2">Customer Segments</h4>
            {/* Segments Table or Chart goes here */}
            <div className="text-gray-500">Coming soon...</div>
          </div>
        )}
        {activeTab === 'behavior' && (
          <div>
            <h4 className="font-semibold mb-2">Customer Behavior</h4>
            {/* Customer behavior analytics go here */}
            <div className="text-gray-500">Coming soon...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAnalytics;
