import React, { useState, useEffect } from 'react';
import UploadForm from '../components/UploadForm'; // Import UploadForm
import RFMChart from '../components/RFMChart'; // Import RFMChart
import CustomerTable from '../components/CustomerTable'; // Import CustomerTable
import AIInsightsCard from '../components/AIInsightsCard'; // Import AIInsightsCard
import TopCustomerRankingTable from '../components/TopCustomerRankingTable'; // Import the ranking table
import * as apiService from '../services/apiService'; // Import all analytics functions
import AnalyticsModal from '../components/AnalyticsModal';
import RevenueAnalytics from '../components/RevenueAnalytics';
import CustomerAnalytics from '../components/CustomerAnalytics';
import VIPCustomersAnalytics from '../components/VIPCustomersAnalytics';
import AvgOrderValueAnalytics from '../components/AvgOrderValueAnalytics';
import { useAuth } from '../context/AuthContext'; // Import useAuth for logout

const DashboardPage = () => {
  const { isAuthenticated, loading: authLoading, authInitialized, logout } = useAuth(); // All at top
  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState('');

  // Fetch uploaded files
  const fetchUploadedFiles = async () => {
    setFilesLoading(true);
    setFilesError('');
    try {
      const files = await apiService.getUploadedFiles();
      setUploadedFiles(files);
    } catch (err) {
      setFilesError('Failed to load uploaded files.');
      setUploadedFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };
// yessssssss
  useEffect(() => {
    if (authInitialized && isAuthenticated) {
      fetchUploadedFiles();
    }
  }, [authInitialized, isAuthenticated]);

  
  // Show loading spinner/message until auth is initialized
  if (authLoading || !authInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-lg text-gray-500">Loading authentication...</span>
      </div>
    );
  }

  // If not authenticated, show error (should be handled by ProtectedRoute, but fallback)
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        You are not authenticated.
      </div>
    );
  }
  const [rfmAnalysis, setRfmAnalysis] = useState(null);
  // --- Analytics Modal State ---
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showAvgOrderModal, setShowAvgOrderModal] = useState(false);
  // --- Analytics Data State ---
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [vipAnalytics, setVIPAnalytics] = useState(null);
  const [avgOrderValue, setAvgOrderValue] = useState(null);
  const [analyticsError, setAnalyticsError] = useState('');
  const [loading, setLoading] = useState(true); // Start loading true initially
  const [error, setError] = useState('');
  

  // --- Ranking Table State ---
  const [ranking, setRanking] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // --- Filter State ---
  const [segmentFilter, setSegmentFilter] = useState(''); // '' for all
  const [minMonetaryFilter, setMinMonetaryFilter] = useState(''); // e.g., '500', '' for no min
  // Updated segment options to reflect backend changes
  

  // Function to fetch RFM data from the backend, now accepting filters
  const fetchRfmData = async (filters = {}) => { // Accept filters object
    setLoading(true);
    setError('');
    console.log("Fetching RFM data from API with filters:", filters); // Log filters
    try {
      // Pass filters to the API service function
      const data = await apiService.getRfmAnalysis(filters);
      setRfmAnalysis(data);
       // Check specifically if the *filtered* data is empty, but analysis object exists
       if (data && data.rfm_data && data.rfm_data.length === 0 && data.summary?.filters_applied && Object.keys(data.summary.filters_applied).length > 0) {
           setError('No customers match the specified filters.'); // Specific message for empty filter results
       } else if (!data || !data.rfm_data || data.rfm_data.length === 0) {
           // Handle case where data exists but is empty after upload
           setError('No customer data found. Upload a CSV or Excel file to get started.'); // Updated message
       }
    } catch (err) {
       if (err.response && err.response.status === 404) {
           setError('No transaction data found for this user. Please upload a CSV or Excel file.'); // Updated message
           setRfmAnalysis(null); // Clear any previous analysis
       } else {
           setError('Failed to fetch RFM analysis data. Please try again later.');
       }
       console.error("RFM fetch error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount (or after upload)
  useEffect(() => {
    // Only fetch if authenticated and auth is initialized
    if (authInitialized && isAuthenticated) {
      fetchRfmData();
    }
    // eslint-disable-next-line
  }, [authInitialized, isAuthenticated]); // Depend on authInitialized and isAuthenticated

  // Function to handle applying filters and refetching data
  const handleApplyFilters = () => {
    // Basic validation for monetary filter
    if (minMonetaryFilter && isNaN(parseFloat(minMonetaryFilter))) {
        setError("Minimum Monetary value must be a number.");
        return;
    }
    setError(''); // Clear validation error if any

    const filters = {};
    // Only add filters if they have a value
    if (segmentFilter) filters.segment = segmentFilter;
    if (minMonetaryFilter) filters.min_monetary = minMonetaryFilter;

    fetchRfmData(filters); // Pass filters to fetch function
  };

  const fetchRanking = async (city = '') => {
    setRankingLoading(true);
    setRankingError('');
    try {
      const data = await apiService.getCustomerRanking(city);
      setRanking(data);
    } catch (err) {
      setRankingError('Failed to fetch ranking data.');
      setRanking([]);
    } finally {
      setRankingLoading(false);
    }
  };

  // Fetch ranking after upload or on city change
  useEffect(() => {
    if (rfmAnalysis && rfmAnalysis.rfm_data && rfmAnalysis.rfm_data.length > 0) {
      fetchRanking(selectedCity);
    }
    // eslint-disable-next-line
  }, [rfmAnalysis, selectedCity]);

  const handleRankingCityChange = (city) => {
    setSelectedCity(city);
  };

  const handleUploadSuccess = () => {
    console.log("Upload successful, refreshing RFM data and ranking...");
    // Reset filters and fetch unfiltered data after upload
    setSegmentFilter('');
    setMinMonetaryFilter('');
    fetchRfmData();
    setSelectedCity(''); // Reset city filter
    fetchUploadedFiles(); // Refresh uploaded files list
  };

  // Define possible segments (can be dynamic later if needed)
  const segmentOptions = [
    '', 'Champions', 'Loyal Customers', 'Potential Loyalists',
    'New Customers', 'Promising', 'Need Attention', 'About To Sleep',
    'At Risk', 'Cannot Lose Them', 'Hibernating', 'Other'
  ];


  // --- Analytics Modal Handlers ---
  const openRevenueModal = async () => {
    setShowRevenueModal(true);
    setAnalyticsError('');
    try {
      setRevenueAnalytics(await apiService.getRevenueAnalytics());
    } catch (err) {
      setAnalyticsError('Failed to load revenue analytics.');
    }
  };
  const openCustomerModal = async () => {
    setShowCustomerModal(true);
    setAnalyticsError('');
    try {
      setCustomerAnalytics(await apiService.getCustomerAnalytics());
    } catch (err) {
      setAnalyticsError('Failed to load customer analytics.');
    }
  };
  const openVIPModal = async () => {
    setShowVIPModal(true);
    setAnalyticsError('');
    try {
      setVIPAnalytics(await apiService.getVIPCustomers());
    } catch (err) {
      setAnalyticsError('Failed to load VIP analytics.');
    }
  };
  const openAvgOrderModal = asynscs() => {
    setShowAvgOrderModal(true);
    setAnalyticsError('');
    try {
      setAvgOrderValue(await apiService.getAvgOrderValue());
    } catch (err) {
      setAnalyticsError('Failed to load average order value.');
    }
  };
//hiiiiscsc
  return (
    // The main padding is now handled by DashboardLayout's <main> tag (p-6)
    <div className="space-y-6">
       {/* New Header Section */}
       <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Insights Dashboard</h1>
         <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-150 flex items-center gap-2">
              <span className="text-lg">📤</span> Upload CSV/Excel
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-full shadow-md text-sm font-semibold hover:bg-indigo-700 transition-all duration-150 flex items-center gap-2">
              <span className="text-lg">✨</span> Generate AI Insights
            </button>
         </div>
       </div>

       {/* --- Time Range Selector --- */}
       <div className="flex flex-wrap gap-2 mb-4">
         {["1 Day","3 Days","1 Week","1 Month","3 Months","6 Months","1 Year"].map((label, idx) => (
           <button
             key={label}
             className={`px-4 py-2 rounded-full border border-gray-200 font-medium text-sm transition-all duration-150 ${idx === 2 ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-indigo-50'}`}
           >
             {label}
           </button>
         ))}
       </div>

      {/* --- Summary Cards Section --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Customers */}
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              {/* User Icon Placeholder */} <span className="text-blue-600 text-2xl">👥</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' :
                  (rfmAnalysis?.summary?.total_customers ?? (ranking.length > 0 ? ranking.length : 0))
                }
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <button
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={openCustomerModal}
            >View all</button>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
         <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              {/* Dollar Icon Placeholder */} <span className="text-green-600 text-2xl">$</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                 {/* Format currency later */}
                 {
                   loading ? '...' :
                   rfmAnalysis?.rfm_data?.reduce((sum, cust) => sum + parseFloat(cust.monetary || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) ??
                   (ranking.length > 0 ? ranking.reduce((sum, row) => sum + parseFloat(row.total_paid || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00')
                 }
              </p>
            </div>
          </div>
           <div className="mt-4 text-sm">
            <button
              className="font-medium text-green-600 hover:text-green-500"
              onClick={openRevenueModal}
            >View report</button>
          </div>
        </div>

         {/* Card 3: Avg Order Value (Placeholder) */}
         <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
               {/* Cart Icon Placeholder */} <span className="text-purple-600 text-2xl">🛒</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">Avg. Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                 {
                   loading ? '...' :
                   (() => {
                     const totalRevenue = rfmAnalysis?.rfm_data?.reduce((sum, cust) => sum + parseFloat(cust.monetary || 0), 0) ??
                       (ranking.length > 0 ? ranking.reduce((sum, row) => sum + parseFloat(row.total_paid || 0), 0) : 0);
                     const totalOrders = rfmAnalysis?.rfm_data?.length ?? ranking.length;
                     if (totalOrders === 0) return '0.00';
                     return `$${(totalRevenue / totalOrders).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                   })()
                 }
              </p>
            </div>
          </div>
           <div className="mt-4 text-sm">
            <button
              className="font-medium text-purple-600 hover:text-purple-500"
              onClick={openAvgOrderModal}
            >View analytics</button>
          </div>
        </div>

         {/* Card 4: VIP Customers */}
         <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
               {/* Star Icon Placeholder */} <span className="text-yellow-600 text-2xl">⭐</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">VIP Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                 {loading ? '...' :
                   (rfmAnalysis?.rfm_data?.slice(0, 10).length ?? ranking.length)
                 }
              </p>
            </div>
          </div>
           <div className="mt-4 text-sm">
            <button
              className="font-medium text-yellow-600 hover:text-yellow-500"
              onClick={openVIPModal}
            >View segment</button>
          </div>
        </div>
      </div>

       {/* --- Modern File Upload Section --- */}
       <div className="mb-6">
         <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-6 flex flex-col items-center justify-center relative transition-all hover:border-indigo-400 hover:bg-indigo-50">
           <div className="flex flex-col items-center">
             <span className="text-4xl text-indigo-400 mb-2">⬆️</span>
             <span className="font-semibold text-gray-700 mb-1">Upload Transaction File</span>
             <span className="text-xs text-gray-500 mb-4 text-center">Upload a CSV or Excel (.xlsx) file with potato sales data. Required columns: relationship_id, date, ...</span>
             <UploadForm onSuccess={handleUploadSuccess} />
           </div>
           {/* Progress bar or success message could go here in future */}
         </div>
       </div>
      {/* --- Uploaded Files Section --- */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <span className="text-indigo-500">📁</span> Uploaded Files
          </h2>
          {filesLoading ? (
            <div className="text-gray-500">Loading files...</div>
          ) : filesError ? (
            <div className="text-red-500">{filesError}</div>
          ) : uploadedFiles.length === 0 ? (
            <div className="text-gray-400 italic">No files uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Filename</th>
                    <th className="px-4 py-2 text-left">Uploaded At</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map(file => (
                    <tr key={file.id} className="border-t">
                      <td className="px-4 py-2">{file.original_filename}</td>
                      <td className="px-4 py-2">{new Date(file.uploaded_at).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <button
                          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs"
                          onClick={async () => {
                            try {
                              const response = await apiService.downloadUploadedFile(file.id);
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', file.original_filename);
                              document.body.appendChild(link);
                              link.click();
                              link.parentNode.removeChild(link);
                            } catch (err) {
                              alert('Failed to download file.');
                            }
                          }}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Remove the separate Filter Controls div */}

      {/* Display Loading / Error / Data */}
      {loading && (
          <div className="text-center p-10">
              <p className="text-gray-600">Loading analysis...</p>
              {/* Optional: Add a spinner */}
          </div>
      )}

      {error && !loading && (
          <div className="text-center p-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
          </div>
      )}

      {/* --- Main Content Area (Chart, AI, Table) --- */}
      {rfmAnalysis && !loading && !error && (
        <div className="space-y-6"> {/* Use space-y for vertical stacking */}

          {/* Section for RFM Chart and AI Insights (potentially side-by-side on larger screens) */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* RFM Segment Chart Card */}
             <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Customer Segments</h2>
                {/* Placeholder Sort/Export */}
                <div className="flex space-x-2">
                   <button className="px-3 py-1 border rounded text-xs text-gray-600 hover:bg-gray-50">Sort</button>
                   <button className="px-3 py-1 border rounded text-xs text-gray-600 hover:bg-gray-50">Export</button>
                </div>
              </div>
              {rfmAnalysis.summary && rfmAnalysis.summary.segment_counts ? (
                <div style={{ height: '300px' }}> {/* Give chart a defined height */}
                  <RFMChart data={rfmAnalysis.summary.segment_counts} />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10">Segment data not available.</p>
              )}
               {/* Placeholder legend/info below chart */}
               <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-500">
                   <span>🔵 VIP</span>
                   <span>🟢 Loyal</span>
                   <span>🟡 Potential</span>
                   <span>🔴 At Risk</span>
               </div>
            </div>

            {/* AI Insights / Assistant Card */}
             <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
               {/* Using AIInsightsCard component - it should handle its internal structure */}
               {/* We might need to adjust AIInsightsCard later to match the "AI Assistant" look */}
               <AIInsightsCard rfmData={rfmAnalysis} />
            </div>
          </div>

          {/* Customer List Table Card */}
           <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
             {/* Integrate Filters into this header */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                 <h2 className="text-lg font-semibold text-gray-800">Customer List</h2>
                 {/* Filter Controls Moved Here */}
                 <div className="flex items-center space-x-2">
                      <input type="text" placeholder="Search Customers..." className="px-3 py-1 border rounded text-sm w-40" /> {/* Placeholder Search */}
                     {/* Segment Filter Dropdown */}
                     <select
                       id="segment-filter-table" // Unique ID
                       value={segmentFilter}
                       onChange={(e) => setSegmentFilter(e.target.value)}
                       className="px-3 py-1 border rounded text-sm"
                     >
                       {segmentOptions.map(option => (
                         <option key={option} value={option}>
                           {option || 'All Segments'}
                         </option>
                       ))}
                     </select>
                      {/* Min Monetary Input */}
                     <input
                       type="number"
                       value={minMonetaryFilter}
                       onChange={(e) => setMinMonetaryFilter(e.target.value)}
                       placeholder="Min $"
                       className="px-3 py-1 border rounded text-sm w-24"
                     />
                     {/* Apply Filters Button */}
                     <button
                       onClick={handleApplyFilters}
                       className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                       disabled={loading}
                     >
                       Apply
                     </button>
                 </div>
             </div>
             {/* Display error message specific to filters if needed */}
             {error === 'Minimum Monetary value must be a number.' && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {/* Pass the detailed rfm_data array to the table */}
            {rfmAnalysis.rfm_data && rfmAnalysis.rfm_data.length > 0 ? (
                 <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
                   <CustomerTable data={rfmAnalysis.rfm_data} />
                 </div>
            ) : (
                 <p className="text-gray-500 text-center py-10">
                    {rfmAnalysis.summary?.filters_applied && Object.keys(rfmAnalysis.summary.filters_applied).length > 0
                        ? 'No customer data matches the current filters.'
                        : 'No customer data available. Upload a CSV or Excel file to get started.'} {/* Updated message */}
                 </p>
            )}
          </div>
        </div>
      )}

      {/* Placeholder for Chatbot (Bonus) */}
      {/* <div className="fixed bottom-4 right-4"> Chatbot component </div> */}

    {/* --- Analytics Modals --- */}
    <AnalyticsModal
      isOpen={showRevenueModal}
      onClose={() => setShowRevenueModal(false)}
      title="Revenue Analytics"
    >
      {analyticsError ? <div className="text-red-600">{analyticsError}</div> : <RevenueAnalytics data={revenueAnalytics} />}
    </AnalyticsModal>
    <AnalyticsModal
      isOpen={showCustomerModal}
      onClose={() => setShowCustomerModal(false)}
      title="Customer Analytics"
    >
      {analyticsError ? <div className="text-red-600">{analyticsError}</div> : <CustomerAnalytics data={customerAnalytics} />}
    </AnalyticsModal>
    <AnalyticsModal
      isOpen={showVIPModal}
      onClose={() => setShowVIPModal(false)}
      title="VIP Customers Analytics"
    >
      {analyticsError ? <div className="text-red-600">{analyticsError}</div> : <VIPCustomersAnalytics data={{ vip_customers: vipAnalytics }} />}
    </AnalyticsModal>
    <AnalyticsModal
      isOpen={showAvgOrderModal}
      onClose={() => setShowAvgOrderModal(false)}
      title="Average Order Value"
    >
      {analyticsError ? <div className="text-red-600">{analyticsError}</div> : <AvgOrderValueAnalytics data={{ value: avgOrderValue }} />}
    </AnalyticsModal>
    </div>
  );
};

export default DashboardPage;
