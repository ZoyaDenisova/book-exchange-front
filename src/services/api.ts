import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
  },
});


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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
        console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 