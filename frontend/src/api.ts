import axios, { InternalAxiosRequestConfig } from 'axios';
import { authStore } from './store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '//localhost:3000',
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.state.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data;
      if (data && typeof data === 'object' && 'errors' in data && Array.isArray(data.errors)) {
         return data.errors.join(', ');
      }
      if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
          return data.error;
      }
      return `Server Error: ${error.response.status}`;
    } else if (error.request) {
      return 'Network Error: No response received from server. Please check your internet connection.';
    } else {
      return `Error: ${error.message}`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export default api;
