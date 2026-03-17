import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { authStore, setToken } from './store';

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

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function onTokenRefreshFailed() {
  refreshSubscribers.forEach((callback) => callback(null));
  refreshSubscribers = [];
}

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = authStore.state.refreshToken;
      
      if (!refreshToken) {
        // No refresh token available, logout user
        setToken(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string | null) => {
            if (!newToken) {
              return reject(error);
            }
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(api(originalRequest));
          });
        });
      }
      
      isRefreshing = true;
      
      try {
        // Call the refresh endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || '//localhost:3000'}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        
        const { token, refresh_token } = response.data;
        
        // Update tokens
        setToken(token, refresh_token);
        
        // Notify all waiting requests
        onTokenRefreshed(token);
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — notify and reject all waiting requests, then logout
        onTokenRefreshFailed();
        setToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

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
