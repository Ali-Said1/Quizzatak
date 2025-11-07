import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL:
  'http://localhost:3000',
  // withCredentials: true,
  timeout: 10000,
});

// Store navigate function from React Router (set this in your App component)
let navigate = null;
export const setNavigate = (navFunc) => {
  navigate = navFunc;
};

// REQUEST INTERCEPTOR: Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Extract readable error message
    const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    error.message || 
                    'Something went wrong';
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry auth endpoints
      if (originalRequest.url.includes('/auth/login') || 
          originalRequest.url.includes('/auth/register') ||
          originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        redirectToLogin();
        return Promise.reject({ ...error, message });
      }
      
      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // Save new token and retry original request
        localStorage.setItem('token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        redirectToLogin();
        return Promise.reject({ ...refreshError, message: 'Session expired. Please login again.' });
      }
    }
    
    // For other errors, attach clean message and reject
    error.message = message;
    return Promise.reject(error);
  }
);

// Helper function to redirect to login
function redirectToLogin() {
  if (navigate) {
    navigate('/login', { replace: true });
  } else {
    window.location.href = '/login';
  }
}

// Export the configured axios instance
export default api;

// Usage example:
// 
// In your App.jsx or main router component:
// import { setNavigate } from './services/api';
// import { useNavigate } from 'react-router-dom';
// 
// function App() {
//   const navigate = useNavigate();
//   useEffect(() => {
//     setNavigate(navigate);
//   }, [navigate]);
// }
//
// In your service files:
// import api from './api';
// 
// const response = await api.get('/quizzes');
// const quiz = response.data;