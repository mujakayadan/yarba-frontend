import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env, isDev } from '../config/env';
import { getToken, removeToken } from '../utils/auth';
import { emitUnauthorized } from '../utils/authEvents';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('API');

debug.log('API URL:', env.apiUrl);

if (isDev) {
  console.log('Creating API service with URL:', env.apiUrl);
}

const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    debug.group(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      debug.log('Using auth token');
    }

    debug.log('Request URL:', `${config.baseURL || ''}${config.url || ''}`);
    debug.groupEnd();
    return config;
  },
  (error) => {
    debug.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    debug.group(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    debug.log('Status:', response.status, response.statusText);
    debug.groupEnd();
    return response;
  },
  (error) => {
    debug.group('API Error Response');

    if (error.response) {
      debug.error('Status:', error.response.status, error.response.statusText);
      debug.error('Data:', error.response.data);

      if (error.response.status === 401) {
        debug.warn('Authentication error - clearing token');
        removeToken();
        emitUnauthorized();
      } else if (error.response.status === 404) {
        debug.warn('Resource not found (404):', error.config?.url);
      }
    } else if (error.request) {
      debug.error('No response received. Request details:', error.request);
    } else {
      debug.error('Request setup error:', error.message);
    }

    debug.groupEnd();
    return Promise.reject(error);
  }
);

export default api;
