import React from 'react';

const CustomerTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-10 italic text-lg">No customer RFM data available.</div>;
  }

  // Define table headers based on the data keys
  const headers = [
    { key: 'customer_id', label: 'Customer ID' },
    { key: 'recency', label: 'Recency (Days)' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'monetary', label: 'Monetary ($)' },
    { key: 'r_score', label: 'R' },
    { key: 'f_score', label: 'F' },
    { key: 'm_score', label: 'M' },
    { key: 'rfm_score', label: 'RFM Score' },
    { key: 'segment', label: 'Segment' },
  ];

  return (
    <div className="overflow-x-auto relative rounded-2xl border border-gray-200 shadow-lg">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="sticky top-0 z-10 text-xs font-semibold text-gray-700 uppercase bg-gray-100 rounded-t-xl shadow">
          <tr>
            {headers.map((header) => (
              <th key={header.key} scope="col" className="py-3 px-6 whitespace-nowrap group cursor-pointer select-none">
                <span className="flex items-center gap-1">
                  {header.label}
                  {/* Static sort icon for now, can be made interactive later */}
                  <svg className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((customer, index) => {
            // Traffic light color for segment
            let segmentColor = '';
            switch ((customer.segment || '').toLowerCase()) {
              case 'super loyal customers':
                segmentColor = 'bg-green-200 text-green-900 border border-green-400';
                break;
              case 'potential loyalist':
              case 'new customers':
                segmentColor = 'bg-blue-200 text-blue-900 border border-blue-400';
                break;
              case 'least thrift shopper':
                segmentColor = 'bg-yellow-200 text-yellow-900 border border-yellow-400';
                break;
              case 'about to sleep':
                segmentColor = 'bg-yellow-200 text-yellow-900 border border-yellow-400';
                break;
              case 'lost':
                segmentColor = 'bg-red-200 text-red-900 border border-red-400';
                break;
              default:
                segmentColor = 'bg-gray-200 text-gray-700 border border-gray-300';
            }
            return (
              <tr key={customer.customer_id || index}
                className={
                  index % 2 === 0
                    ? 'bg-white hover:bg-blue-50 transition-colors'
                    : 'bg-gray-50 hover:bg-blue-50 transition-colors'
                }
              >
                {headers.map((header) => (
                  <td key={`${header.key}-${index}`} className={
                    'py-4 px-6 whitespace-nowrap' +
                    (header.key === 'segment' ? ` rounded-full font-semibold px-4 py-2 ${segmentColor}` : '')
                  }>
                    {header.key === 'monetary'
                      ? parseFloat(customer[header.key]).toFixed(2)
                      : header.key === 'segment' ? (
                        <span className="flex items-center gap-2">
                          <span className={`inline-block w-3 h-3 rounded-full border ${segmentColor.replace('text-', 'bg-')}`}></span>
                          {customer[header.key]}
                        </span>
                      ) : customer[header.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Modern Load More area (placeholder) */}
      <div className="flex justify-center py-4">
        <button className="px-5 py-2 rounded-full bg-indigo-100 text-indigo-700 font-semibold shadow hover:bg-indigo-200 transition disabled:opacity-50" disabled>
          Load More
        </button>
      </div>
    </div>
  );
};

export default CustomerTable;
