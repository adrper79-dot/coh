import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Use replace to avoid pushing a new history entry
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.history.replaceState(null, '', `/login?redirect=${encodeURIComponent(currentPath)}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    return Promise.reject(error.response?.data ?? error);
  }
);

export default apiClient;
