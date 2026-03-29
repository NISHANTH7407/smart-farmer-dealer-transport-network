import axios from 'axios';
import { getAuthToken, clearAuth } from '../utils/auth';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        clearAuth(); 
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      if (error.response.status === 403) {
        window.location.href = '/unauthorized';
        return Promise.reject(error);
      }
      
      if (error.response.status >= 500) {
        toast.error('Server error occurred. Please try again later.');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
