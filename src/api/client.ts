import axios from 'axios';
import type {AxiosInstance} from 'axios';
import {useAuthStore} from '../stores/authStore';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (apiClient) {
    return apiClient;
  }
  return createAndCacheApiClient();
}

function buildClient(url: string, key: string, secret: string): AxiosInstance {
  const baseURL = `${url.replace(/\/+$/, '')}/wp-json/wc/v3`;
  const client = axios.create({
    baseURL,
    timeout: 15000,
    params: {consumer_key: key, consumer_secret: secret},
  });
  client.interceptors.response.use(
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
      return Promise.reject({code: 'REQUEST_ERROR', message: error.message});
    },
  );
  return client;
}

export function createApiClient(
  siteUrl?: string,
  consumerKey?: string,
  consumerSecret?: string,
): AxiosInstance {
  if (siteUrl !== undefined && consumerKey !== undefined && consumerSecret !== undefined) {
    return buildClient(siteUrl, consumerKey, consumerSecret);
  }
  const stored = useAuthStore.getState();
  return buildClient(stored.siteUrl, stored.consumerKey, stored.consumerSecret);
}

function createAndCacheApiClient(): AxiosInstance {
  const {siteUrl, consumerKey, consumerSecret} = useAuthStore.getState();
  apiClient = buildClient(siteUrl, consumerKey, consumerSecret);
  return apiClient;
}

export function resetApiClient(): void {
  apiClient = null;
}
