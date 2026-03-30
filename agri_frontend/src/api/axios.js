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
        window.location.href = '/login/farmer';
        return Promise.reject(error);
      }
      // Do NOT redirect on 403 — let the component handle it with a toast
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        `Request failed (${error.response.status})`;
      toast.error(message);
    } else {
      toast.error('Network error — is the backend running?');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
