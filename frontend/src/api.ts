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

export default api;
