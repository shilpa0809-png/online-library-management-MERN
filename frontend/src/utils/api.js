// src/utils/api.js
import axios from 'axios'; // Import the axios library

// Create a custom Axios instance. This allows you to set default configurations
// that will apply to all requests made using this 'api' instance.
const api = axios.create({
  // baseURL: This is the base URL for all your API requests.
  // It uses the VITE_API_BASE_URL from your .env file (e.g., http://localhost:5000/api).
  // If the environment variable isn't set, it defaults to 'http://localhost:5000/api'.
  // *** ENSURE THIS IS EXACTLY 'http://localhost:5000/api' ***
  baseURL: 'https://online-library-management-mern-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json', // Default header for most API requests
  },
});

// Axios Request Interceptor:
// This function runs *before* every request is sent.
// It's used here to automatically attach the authentication token to requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get the JWT token from localStorage
    if (token) {
      // If a token exists, add it to the 'Authorization' header in the format 'Bearer <token>'
      // This is the standard way to send JWTs for authentication.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Return the modified request configuration
  },
  (error) => {
    // Handle any errors that occur during the request setup
    return Promise.reject(error);
  }
);

// Axios Response Interceptor:
// This function runs *after* every response is received.
// It's used here to handle common API response errors, specifically 401 Unauthorized.
api.interceptors.response.use(
  (response) => response, // If the response is successful (2xx status), just return it
  (error) => {
    // Check if the response error status is 401 (Unauthorized)
    // and ensure it's not an authentication route itself (to avoid infinite loops)
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/')) {
      console.warn('Unauthorized API call. Clearing token and potentially redirecting to login.');
      localStorage.removeItem('token'); // Remove the invalid token from localStorage
      delete api.defaults.headers.common['Authorization']; // Clear the token from Axios default headers
      // In a real application, you might also want to programmatically navigate the user to the login page here.
      // For this setup, the AuthContext and PrivateRoute will handle the redirection.
    }
    return Promise.reject(error); // Re-throw the error so it can be caught by the component making the API call
  }
);

export default api; // Export the configured Axios instance
