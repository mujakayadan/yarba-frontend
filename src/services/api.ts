import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { env, isDev } from '../config/env';
import { getToken, removeToken } from '../utils/auth';
import { emitUnauthorized } from '../utils/authEvents';
import { createDebugger } from '../utils/debug';
import { requestNativeSessionRefresh } from './nativeAuthSession';

const debug = createDebugger('API');

debug.log('API URL:', env.apiUrl);

if (isDev) {
  console.log('Creating API service with URL:', env.apiUrl);
}

const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _nativeAuthRetry?: boolean;
}

const NATIVE_AUTH_REFRESH_EXCLUSIONS = [
  '/auth/password/login',
  '/auth/password/register',
  '/auth/password/refresh',
  '/auth/password/forgot-password',
  '/auth/password/reset-password',
  '/auth/password/request-verification',
  '/auth/password/confirm-verification',
  '/auth/oauth/',
] as const;

let nativeRefreshPromise: Promise<void> | null = null;

const isNativeRefreshExcluded = (url?: string): boolean =>
  NATIVE_AUTH_REFRESH_EXCLUSIONS.some((path) => url?.includes(path));

const refreshNativeSessionOnce = (): Promise<void> => {
  if (!nativeRefreshPromise) {
    nativeRefreshPromise = requestNativeSessionRefresh()
      .then(() => undefined)
      .catch((error: unknown) => {
        removeToken();
        emitUnauthorized();
        throw error;
      })
      .finally(() => {
        nativeRefreshPromise = null;
      });
  }

  return nativeRefreshPromise;
};

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
  (response: AxiosResponse) => {
    debug.group(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    debug.log('Status:', response.status, response.statusText);
    debug.groupEnd();
    return response;
  },
  async (error: AxiosError) => {
    debug.group('API Error Response');

    if (error.response) {
      debug.error('Status:', error.response.status, error.response.statusText);
      debug.error('Data:', error.response.data);

      if (
        error.response.status === 401 &&
        env.nativeAuth &&
        error.config &&
        !isNativeRefreshExcluded(error.config.url)
      ) {
        const requestConfig = error.config as RetriableRequestConfig;

        if (!requestConfig._nativeAuthRetry) {
          requestConfig._nativeAuthRetry = true;
          debug.warn('Authentication error - refreshing native session');

          try {
            await refreshNativeSessionOnce();
            debug.groupEnd();
            return api.request(requestConfig);
          } catch {
            debug.groupEnd();
            return Promise.reject(error);
          }
        }

        debug.warn('Authentication retry failed - clearing token');
        removeToken();
        emitUnauthorized();
      } else if (error.response.status === 401 && !env.nativeAuth) {
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
