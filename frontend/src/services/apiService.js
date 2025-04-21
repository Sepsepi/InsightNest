import axios from 'axios';

// Define the base URL for the Django backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'; // Default to local Django dev server

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // We can add the Authorization header dynamically based on auth state
  },
});

// Function to set the Authorization token header
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
    console.log("Auth token set");
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log("Auth token removed");
  }
};

// --- Authentication Endpoints ---

export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/token/', { username, password });
    // Assuming the backend returns { token: '...' } upon successful login
    if (response.data.token) {
      setAuthToken(response.data.token); // Set token for subsequent requests
    }
    return response.data; // Contains user info and token
  } catch (error) {
    console.error('Login API error:', error.response || error.message);
    // Rethrow or handle specific error codes (e.g., 400 for bad credentials)
    throw error;
  }
};

export const registerUser = async (username, email, password, password2) => {
  try {
    // Ensure password2 is included as expected by the backend serializer
    const response = await apiClient.post('/users/register/', { username, email, password, password2 });
     // Backend returns user data and token upon successful registration
    if (response.data.token) {
        setAuthToken(response.data.token); // Optionally log in the user immediately
    }
    return response.data;
  } catch (error) {
    console.error('Register API error:', error.response || error.message);
     // Handle specific errors (e.g., username/email already exists)
    if (error.response && error.response.data) {
        // Pass backend validation errors forward if available
        throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
    }
};

// --- User Endpoints ---
export const getCurrentUserDetails = async () => {
    try {
        const response = await apiClient.get('/users/me/');
        return response.data; // { id, username, email, first_name, last_name }
    } catch (error) {
        console.error('Get User Details API error:', error.response || error.message);
        // Handle specific errors like 401 Unauthorized if needed
        throw error;
    }
};

// --- RFM Endpoints ---

// List uploaded files for the authenticated user
export const getUploadedFiles = async () => {
    try {
        const response = await apiClient.get('/rfm/uploaded-files/');
        return response.data.files || [];
    } catch (error) {
        console.error('Get Uploaded Files API error:', error.response || error.message);
        throw error;
    }
};

// Download a specific uploaded file by ID (returns a blob)
export const downloadUploadedFile = async (fileId) => {
    try {
        const response = await apiClient.get(`/rfm/uploaded-files/${fileId}/download/`, {
            responseType: 'blob', // Important for file downloads
        });
        return response;
    } catch (error) {
        console.error('Download Uploaded File API error:', error.response || error.message);
        throw error;
    }
};

// Fetch top 10 customer ranking (optionally filtered by city)
export const getCustomerRanking = async (city = '') => {
    try {
        let url = '/rfm/ranking/';
        if (city) {
            url += `?city=${encodeURIComponent(city)}`;
        }
        const response = await apiClient.get(url);
        return response.data.ranking || [];
    } catch (error) {
        console.error('Customer Ranking API error:', error.response || error.message);
        throw error;
    }
};

// Correct the function signature to accept formData directly
export const uploadTransactions = async (formData) => {
    // Remove internal FormData creation - it's already created in UploadForm.jsx
    // const formData = new FormData();
    // formData.append('file', file);

    try {
        // Pass the received formData object directly
        const response = await apiClient.post('/rfm/upload/', formData, {
             headers: {
                 // Axios typically sets the correct Content-Type for FormData automatically,
                 // but explicitly setting it might be needed in some cases or for clarity.
                 // If issues persist, try removing this explicit header setting.
                 'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // e.g., { message: 'Successfully uploaded...' }
    } catch (error) {
        console.error('Upload API error:', error.response || error.message);
        if (error.response && error.response.data) {
             throw new Error(JSON.stringify(error.response.data));
        }
        throw error;
    }
};

// --- Analytics Endpoints ---

// Revenue analytics (by product type, weight, time, graph)
export const getRevenueAnalytics = async (period = 'all') => {
    try {
        const response = await apiClient.get(`/rfm/analytics/revenue/?period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Revenue Analytics API error:', error.response || error.message);
        throw error;
    }
};

// Customer analytics (all, top 40, logs, graph)
export const getCustomerAnalytics = async () => {
    try {
        const response = await apiClient.get('/rfm/analytics/customers/');
        return response.data;
    } catch (error) {
        console.error('Customer Analytics API error:', error.response || error.message);
        throw error;
    }
};

// VIP customers analytics (top 50 by loyalty points/payments)
export const getVIPCustomers = async () => {
    try {
        const response = await apiClient.get('/rfm/analytics/vip/');
        return response.data.vip_customers || [];
    } catch (error) {
        console.error('VIP Customers API error:', error.response || error.message);
        throw error;
    }
};

// Average order value
export const getAvgOrderValue = async () => {
    try {
        const response = await apiClient.get('/rfm/analytics/avg-order-value/');
        return response.data.avg_order_value;
    } catch (error) {
        console.error('Avg Order Value API error:', error.response || error.message);
        throw error;
    }
};

// Update getRfmAnalysis to accept optional filters
export const getRfmAnalysis = async (filters = {}) => {
    try {
        // Construct query parameters from the filters object
        const queryParams = new URLSearchParams(filters).toString();
        const url = `/rfm/analysis/${queryParams ? '?' + queryParams : ''}`;
        console.log(`Requesting RFM data from: ${url}`); // Log the URL with params
        const response = await apiClient.get(url);
        return response.data; // { rfm_data: [...], summary: {...} }
    } catch (error) {
        console.error('RFM Analysis API error:', error.response || error.message);
        throw error;
    }
};

// --- AI Insights Endpoint ---

export const generateAiInsights = async () => {
    try {
        const response = await apiClient.get('/ai/generate/');
        return response.data; // e.g., { insights: '...' }
    } catch (error) {
        console.error('AI Insights API error:', error.response || error.message);
        throw error;
    }
};


// Export the configured client if needed elsewhere, though using specific functions is often cleaner
// export default apiClient;

// Export functions individually
export default {
    setAuthToken,
    loginUser,
    registerUser,
    uploadTransactions,
    getRfmAnalysis,
    generateAiInsights,
    getCurrentUserDetails,
    getCustomerRanking,
};
