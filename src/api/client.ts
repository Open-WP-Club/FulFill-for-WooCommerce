import axios from 'axios';
import type {AxiosInstance} from 'axios';
import {useAuthStore} from '../stores/authStore';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (apiClient) {
    return apiClient;
  }
  return createApiClient();
}

export function createApiClient(): AxiosInstance {
  const {siteUrl, consumerKey, consumerSecret} = useAuthStore.getState();

  const baseURL = `${siteUrl.replace(/\/+$/, '')}/wp-json/wc/v3`;

  apiClient = axios.create({
    baseURL,
    timeout: 15000,
    params: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    },
  });

  apiClient.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        const wcError = error.response.data;
        return Promise.reject({
          code: wcError?.code ?? 'UNKNOWN_ERROR',
          message: wcError?.message ?? 'An unknown error occurred',
          data: {status: error.response.status},
        });
      }
      if (error.request) {
        return Promise.reject({
          code: 'NETWORK_ERROR',
          message: 'Network request failed. Check your connection.',
        });
      }
      return Promise.reject({
        code: 'REQUEST_ERROR',
        message: error.message,
      });
    },
  );

  return apiClient;
}

export function resetApiClient(): void {
  apiClient = null;
}
