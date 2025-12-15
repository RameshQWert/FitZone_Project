import axios from 'axios';

// Dynamically determine API URL - use same host as the frontend
const getApiUrl = () => {
  // If explicitly set in env, use that
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For development: use the same hostname as the browser
  // This allows phone access via IP while laptop uses localhost
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};

const API_URL = getApiUrl();

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Optimize connection
  timeout: 10000,
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Cached GET request helper
export const cachedGet = async (url, options = {}) => {
  const cacheKey = url;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const response = await api.get(url, options);
  cache.set(cacheKey, { data: response, timestamp: Date.now() });
  return response;
};

// Clear cache helper
export const clearCache = (url) => {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
};

export default api;
