import axios from 'axios';
import { handleMockRequest } from './mockHandler';

const isDeployedWithoutBackend =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 4000,
});

API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore restricted localStorage
  }

  // If deployed on Vercel without an external API URL, use the mock handler directly for instant speed
  if (isDeployedWithoutBackend) {
    config.adapter = async (cfg) => {
      return handleMockRequest(cfg);
    };
  }

  return config;
});

// Response interceptor: graceful fallback for network failures
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error');

    if (isNetworkError) {
      console.info('StaffTrack: Backend server offline. Seamlessly serving interactive demo data.');
      try {
        const mockRes = handleMockRequest(error.config);
        return Promise.resolve(mockRes);
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
