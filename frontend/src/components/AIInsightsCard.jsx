import React, { useState } from 'react';
import apiService from '../services/apiService';

const AIInsightsCard = ({ rfmData }) => {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateInsights = async () => {
    // Check if there's data to analyze
    if (!rfmData || !rfmData.rfm_data || rfmData.rfm_data.length === 0) {
        setError('No customer data available to generate insights. Please upload data first.');
        setInsights(''); // Clear previous insights
        return;
    }

    setLoading(true);
    setError('');
    setInsights(''); // Clear previous insights before generating new ones

    try {
      const response = await apiService.generateAiInsights();
      // Assuming the response format is { insights: "..." }
      setInsights(response.insights || 'No insights generated.');
    } catch (err) {
      let errorMessage = 'Failed to generate AI insights.';
       if (err.response && err.response.data && err.response.data.error) {
           errorMessage = err.response.data.error; // Use specific error from backend if available
       } else if (err.message) {
           errorMessage = err.message;
       }
      setError(errorMessage);
      console.error("AI Insights generation error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-2xl bg-white shadow-lg h-full flex flex-col max-w-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-700">
        <span className="text-2xl">🤖</span>
        AI-Powered Insights
      </h3>
      <button
        onClick={handleGenerateInsights}
        disabled={loading || !rfmData}
        className="mb-4 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {loading ? 'Generating...' : 'Generate Insights'}
      </button>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="flex-grow overflow-auto bg-indigo-50 p-4 rounded-xl border border-indigo-100">
        {insights ? (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{insights}</pre>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {loading ? 'Generating insights, please wait...' : 'Click the button above to generate AI insights based on the current customer data.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIInsightsCard;
