import axios from "axios";

// In a real app, this would point to your backend API
// For this mock setup, we'll use an interceptor to simulate API calls
export const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock interceptor to simulate network delay
api.interceptors.request.use(async (config) => {
  // Simulate network delay
  config.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3JvbGUiOiJhZG1pbiIsInVzZXJfZW1haWwiOiJyYW5nZ2FAZGV2LmNvbSIsImlzcyI6ImdhbWluZ2t1LWF1dGhlbnRpY2F0aW9uLXN5c3RlbSIsImV4cCI6MTc3NDUwNDg2MiwiaWF0IjoxNzc0NDk3NjYyfQ.FiXwKmi7q06NzTlgpicbc5mmAlLi-iG76WqXMIwF1Pw`;
  await new Promise((resolve) => setTimeout(resolve, 500));
  return config;
});
