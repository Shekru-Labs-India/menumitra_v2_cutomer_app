import axios from 'axios';

// API configuration
const API_BASE_URL = 'https://men4u.xyz';
export const API_VERSION = '/v2';
export const APP_PREFIX = '/user';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Helper function to get auth data
const getAuthData = () => {
  try {
    const authData = localStorage.getItem('auth');
    return authData ? JSON.parse(authData) : null;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    return null;
  }
};

// Add request interceptor to handle auth token
axiosInstance.interceptors.request.use((config) => {
  const userData = getAuthData();
  if (userData?.accessToken) {
    config.headers.Authorization = `Bearer ${userData.accessToken}`;
  }
  return config;
});

export default axiosInstance; 