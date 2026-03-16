import axios from 'axios';

// In a real app, this would point to your backend API
// For this mock setup, we'll use an interceptor to simulate API calls
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock interceptor to simulate network delay
api.interceptors.request.use(async (config) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return config;
});
