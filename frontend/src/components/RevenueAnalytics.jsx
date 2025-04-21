import React, { useState } from 'react';

const RevenueAnalytics = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <div className="text-center text-gray-400 py-10 italic text-lg">No revenue analytics available.</div>;
  }
  if (!data) return <div>No revenue analytics available.</div>;
  const {
    total_revenue = 0,
    total_transactions = 0,
    avg_order_value = 0,
    return_rate = 0,
    potato_performance = [],
    revenue_trends = [],
    sales_reps = [],
  } = data;
  const [activeTab, setActiveTab] = useState('potato');
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-[1.03] transition">
          <span className="text-green-600 text-3xl mb-2">💰</span>
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Revenue</span>
          <span className="text-3xl font-bold text-green-700 my-1">${total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          <span className="text-xs text-gray-400 mt-1">Sample Data</span>
        </div>
        <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-[1.03] transition">
          <span className="text-indigo-600 text-3xl mb-2">🧾</span>
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Transactions</span>
          <span className="text-3xl font-bold text-indigo-700 my-1">{total_transactions}</span>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-[1.03] transition">
          <span className="text-purple-600 text-3xl mb-2">📊</span>
          <span className="text-xs font-semibold text-gray-500 uppercase">Average Order Value</span>
          <span className="text-3xl font-bold text-purple-700 my-1">${avg_order_value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-[1.03] transition">
          <span className="text-red-500 text-3xl mb-2">↩️</span>
          <span className="text-xs font-semibold text-gray-500 uppercase">Return Rate</span>
          <span className="text-3xl font-bold text-red-600 my-1">{return_rate}%</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className={`px-5 py-2 rounded-full font-semibold text-sm shadow transition-all duration-150 ${activeTab === 'potato' ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'}`} onClick={() => setActiveTab('potato')}>Potato Analysis</button>
        <button className={`px-5 py-2 rounded-full font-semibold text-sm shadow transition-all duration-150 ${activeTab === 'trends' ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'}`} onClick={() => setActiveTab('trends')}>Revenue Trends</button>
        <button className={`px-5 py-2 rounded-full font-semibold text-sm shadow transition-all duration-150 ${activeTab === 'reps' ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'}`} onClick={() => setActiveTab('reps')}>Sales Representatives</button>
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === 'potato' && (
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-700">
              🥔 Potato Type Performance
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg bg-white">
              <table className="min-w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 rounded-t-xl shadow">
                  <tr>
                    <th className="px-4 py-2 group cursor-pointer select-none">Rank <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                    <th className="px-4 py-2 group cursor-pointer select-none">Potato Type <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                    <th className="px-4 py-2 group cursor-pointer select-none">Revenue <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                    <th className="px-4 py-2 group cursor-pointer select-none">Quantity (kg) <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                    <th className="px-4 py-2 group cursor-pointer select-none">Transactions <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                    <th className="px-4 py-2 group cursor-pointer select-none">Avg. Price/kg <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                  </tr>
                </thead>
                <tbody>
                  {potato_performance.slice(0, 20).map((row, idx) => (
                    <tr key={row.type || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-semibold">{idx + 1}</td>
                      <td className="px-4 py-2">{row.type}</td>
                      <td className="px-4 py-2">${Number(row.revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-2">{row.quantity} kg</td>
                      <td className="px-4 py-2">{row.transactions}</td>
                      <td className="px-4 py-2">{row.avg_price_kg ? `$${row.avg_price_kg}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'trends' && (
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-700">📈 Revenue Trends</h4>
            {/* Placeholder for future chart */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl shadow mb-6 flex items-center justify-center h-36 text-indigo-400 text-xl font-semibold">
              [Revenue Trends Chart Coming Soon]
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg bg-white">
              <table className="min-w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 rounded-t-xl shadow">
                  <tr>
                    <th className="px-4 py-2 group cursor-pointer select-none">Date <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                    <th className="px-4 py-2 group cursor-pointer select-none">Revenue ($) <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                  </tr>
                </thead>
                <tbody>
                  {revenue_trends.map((row, idx) => (
                    <tr key={row.date || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2">{row.date}</td>
                      <td className="px-4 py-2">${Number(row.revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'reps' && (
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-700">👨‍💼 Sales Representatives</h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg bg-white">
              <table className="min-w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 rounded-t-xl shadow">
                  <tr>
                    <th className="px-4 py-2 group cursor-pointer select-none">Name <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                    <th className="px-4 py-2 group cursor-pointer select-none">Revenue <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                    <th className="px-4 py-2 group cursor-pointer select-none">Transactions <svg className="inline w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg></th>
                  </tr>
                </thead>
                <tbody>
                  {sales_reps.map((row, idx) => (
                    <tr key={row.name || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2">{row.name}</td>
                      <td className="px-4 py-2">${Number(row.revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-2">{row.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueAnalytics;
