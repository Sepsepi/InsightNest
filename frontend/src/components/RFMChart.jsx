import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Define consistent colors for segments (adjust as needed)
const SEGMENT_COLORS = {
    'Super Loyal Customers': '#22c55e', // green-500
    'Potential Loyalists': '#6366f1', // indigo-500
    'New Customers': '#a855f7', // purple-500
    'Promising': '#ec4899', // pink-500
    'Need Attention': '#f97316', // orange-500
    'About To Sleep': '#eab308', // yellow-500
    'Least Thrift Shopper': '#ef4444', // red-500
    'Cannot Lose Them': '#dc2626', // red-600
    'Hibernating': '#6b7280', // gray-500
    'Other': '#9ca3af', // gray-400
};

const RFMChart = ({ data }) => {
  if (!data || !data.rfm_data || !Array.isArray(data.rfm_data) || data.rfm_data.length === 0) {
    return <div className="text-center text-gray-400 py-10 italic text-lg">No RFM chart data available.</div>;
  }
  // Transform the segment_counts object into an array suitable for Recharts
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    count: value,
  }));

  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-gray-500">No segment data available to display chart.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col" style={{ width: '100%', height: 370 }}>
      <div className="flex items-center justify-center mb-4 gap-2">
        <span className="text-2xl">📊</span>
        <h3 className="text-xl font-bold tracking-tight text-gray-800">Customer Segment Distribution</h3>
      </div>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0} fontSize="12px" />
          <YAxis allowDecimals={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              const color = SEGMENT_COLORS[label] || SEGMENT_COLORS['Other'];
              return (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                    <span className="font-semibold">{label}</span>
                  </div>
                  <div>Customer Count: <span className="font-bold">{payload[0].value}</span></div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" name="Customer Count">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.name] || SEGMENT_COLORS['Other']} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Horizontal scrollable legend */}
      <div className="flex flex-row flex-nowrap overflow-x-auto gap-3 mt-6 px-2 pb-2">
        {Object.entries(SEGMENT_COLORS).map(([segment, color]) => (
          <span key={segment} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200" style={{ backgroundColor: color, color: '#fff', minWidth: 0 }}>
            <span className="inline-block w-2 h-2 rounded-full border border-white" style={{ backgroundColor: '#fff', opacity: 0.7 }}></span>
            {segment}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RFMChart;
