import axios from 'axios';
import API_CONFIG from '@/config/api.config';
import {
  AUTH_TOKEN_KEY,
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from './storage-manager';
import { normalizeApiError } from './api-error';
import { createSingleFlight } from './single-flight';

const BASE_URL =
  import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:8080/api/v1';
const TIMEOUT_MS = 15000;

/*
 * RESPONSE CONVENTION (verified against the backend's GlobalResponseHandler):
 *   - The backend wraps every body as { timeStamp, data, error }.
 *   - This instance's interceptor unwraps the HTTP layer only: awaiting a call yields that envelope.
 *   - Hooks/components read the payload ONE level down with `response.data`.
 *   - 204 responses have no body, so `response.data` is undefined.
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // needed for the HttpOnly refresh-token cookie
  timeout: TIMEOUT_MS,
});

// A bare client (no interceptors) for the refresh call, so it can never recurse.
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: TIMEOUT_MS,
});

const AUTH_ENDPOINTS = [
  API_CONFIG.AUTH.SIGN_IN,
  API_CONFIG.AUTH.SIGN_UP,
  API_CONFIG.AUTH.REFRESH,
  API_CONFIG.AUTH.LOGOUT,
];

const authFailureListeners = new Set();
export function onAuthFailure(listener) {
  authFailureListeners.add(listener);
  return () => authFailureListeners.delete(listener);
}

const refreshAccessToken = createSingleFlight(async () => {
  const response = await refreshClient.post(API_CONFIG.AUTH.REFRESH);
  const token = response?.data?.data?.accessToken;
  if (!token) throw new Error('Refresh response did not contain an access token');
  setStorageItem(AUTH_TOKEN_KEY, token);
  return token;
});

axiosInstance.interceptors.request.use((request) => {
  const authToken = getStorageItem(AUTH_TOKEN_KEY);
  if (authToken) {
    request.headers['Authorization'] = `Bearer ${authToken}`;
  }
  return request;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;

    // Access tokens live 10 minutes. On 401, try ONE refresh (shared by all concurrent requests)
    // and replay the request once. Never for auth endpoints and never twice for the same request.
    const canRefresh =
      status === 401 &&
      config &&
      !config._retried &&
      !AUTH_ENDPOINTS.some((endpoint) => config.url === endpoint);

    if (canRefresh) {
      config._retried = true;
      try {
        const token = await refreshAccessToken();
        config.headers['Authorization'] = `Bearer ${token}`;
        return axiosInstance(config);
      } catch {
        removeStorageItem(AUTH_TOKEN_KEY);
        authFailureListeners.forEach((listener) => listener());
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export default axiosInstance;
