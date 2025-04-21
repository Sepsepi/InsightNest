import React, { useState } from 'react';
import apiService from '../services/apiService'; // Import the API service

const UploadForm = ({ onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Remove state for custom columns

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(''); // Clear previous errors on new file selection
    setSuccessMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first.');
      return;
    }

    // Remove custom column validation and client-side type check
    // if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
    //     setError('Invalid file type. Please upload a CSV file.');
    //     return;
    // }

    setUploading(true);
    setError('');
    setSuccessMessage('');

    // --- Prepare FormData (only file needed now) ---
    const formData = new FormData();
    formData.append('file', selectedFile);

    // Remove adding custom column names
    // Log formData content for debugging (optional)
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }

    try {
      // Pass the formData directly to the apiService
      const response = await apiService.uploadTransactions(formData);
      setSuccessMessage(response.message || 'File uploaded successfully!');
      setSelectedFile(null); // Clear file input after successful upload
      // Clear the file input visually
      document.getElementById('file-upload').value = null; // Use updated id
      if (onSuccess) {
        onSuccess(); // Notify parent component (DashboardPage) about success
      }
    } catch (err) {
       let errorMessage = 'Failed to upload file.';
       // Try to parse backend error
       if (err.message) {
           try {
               const parsedError = JSON.parse(err.message);
               // Handle specific error structures from the backend if known
               if (parsedError.error) { // Check for single 'error' key
                   errorMessage = parsedError.error;
               } else if (parsedError.errors) { // Check for list of 'errors'
                   errorMessage = parsedError.errors.join(' ');
               } else { // Fallback for other structures
                   errorMessage = Object.entries(parsedError)
                       .map(([field, messages]) => `${field}: ${messages.join(' ')}`)
                       .join('; ');
               }
           } catch (parseError) {
               errorMessage = err.message || errorMessage; // Fallback if not JSON
           }
       }
      setError(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold mb-3">Upload Transaction File</h3>
      <p className="text-sm text-gray-600 mb-1">
        Upload a CSV or Excel (.xlsx, .xls) file. Default columns: <code>customer_id</code>, <code>purchase_date</code> (YYYY-MM-DD or MM/DD/YYYY), <code>amount</code>.
      </p>
      {/* --- File Input --- */}
      <div className="flex items-center space-x-3 mb-4">
        <input
          type="file"
          id="file-upload" // Rename id for clarity
          accept=".csv, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     disabled:opacity-50"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {successMessage && <p className="text-green-600 text-sm mt-2">{successMessage}</p>}

      {/* Remove Custom Column Name Section */}
    </div>
  );
};

export default UploadForm;
