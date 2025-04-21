import React from 'react';

/**
 * TopCustomerRankingTable
 * Shows a table of the top 10 customers by total paid with their city.
 * @param {Object[]} data - Array of ranking objects [{customer_id, city, total_paid}]
 * @param {boolean} loading - Whether the ranking is loading
 * @param {string} error - Error message (if any)
 * @param {Function} onCityChange - Handler for city filter change
 * @param {string[]} cityOptions - List of available cities
 * @param {string} selectedCity - Currently selected city
 */
const TopCustomerRankingTable = ({ data = [], loading, error, onCityChange, cityOptions = [], selectedCity }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Top 10 Customers (Total Paid)</h2>
        {cityOptions.length > 1 && (
          <select
            className="border px-3 py-1 rounded text-sm"
            value={selectedCity || ''}
            onChange={e => onCityChange(e.target.value)}
          >
            <option value="">All Cities</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
      </div>
      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No data to display yet. Upload your first file to see the top customers.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-gray-100 rounded-t-xl">
              <tr>
                <th className="px-4 py-2 whitespace-nowrap">Rank</th>
                <th className="px-4 py-2 whitespace-nowrap">Customer ID</th>
                <th className="px-4 py-2 whitespace-nowrap">City</th>
                <th className="px-4 py-2 whitespace-nowrap">Total Paid</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                // Traffic light color for ranks
                let rankColor = '';
                if (idx === 0) rankColor = 'bg-green-100 text-green-800';
                else if (idx === 1 || idx === 2) rankColor = 'bg-yellow-100 text-yellow-800';
                else if (idx === 3 || idx === 4) rankColor = 'bg-blue-100 text-blue-800';
                else rankColor = 'bg-gray-100 text-gray-700';
                return (
                  <tr key={row.customer_id + row.city}
                      className={
                        idx % 2 === 0
                          ? 'bg-white hover:bg-blue-50 transition-colors'
                          : 'bg-gray-50 hover:bg-blue-50 transition-colors'
                      }
                  >
                    <td className={`px-4 py-2 font-semibold rounded-l ${rankColor}`}>{idx + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.customer_id}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.city}</td>
                    <td className="px-4 py-2 whitespace-nowrap">${Number(row.total_paid).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopCustomerRankingTable;
