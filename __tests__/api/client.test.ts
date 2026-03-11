jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    createMMKV: () => ({
      getString: (key: string) => store.get(key),
      set: (key: string, value: string | number | boolean) =>
        store.set(key, String(value)),
      remove: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    }),
  };
});

import {createApiClient, getApiClient, resetApiClient} from '../../src/api/client';
import {useAuthStore} from '../../src/stores/authStore';

describe('API client', () => {
  beforeEach(() => {
    resetApiClient();
    useAuthStore.getState().login(
      'https://mystore.com/',
      'ck_test123',
      'cs_secret456',
    );
  });

  afterEach(() => {
    useAuthStore.getState().logout();
  });

  describe('createApiClient', () => {
    it('creates an axios instance with correct baseURL', () => {
      const client = createApiClient();
      expect(client.defaults.baseURL).toBe('https://mystore.com/wp-json/wc/v3');
    });

    it('strips trailing slashes from store URL', () => {
      useAuthStore.getState().login('https://store.com///', 'ck', 'cs');
      resetApiClient();
      const client = createApiClient();
      expect(client.defaults.baseURL).toBe('https://store.com/wp-json/wc/v3');
    });

    it('includes consumer key and secret as default params', () => {
      const client = createApiClient();
      expect(client.defaults.params.consumer_key).toBe('ck_test123');
      expect(client.defaults.params.consumer_secret).toBe('cs_secret456');
    });

    it('sets 15s timeout', () => {
      const client = createApiClient();
      expect(client.defaults.timeout).toBe(15000);
    });
  });

  describe('getApiClient', () => {
    it('returns a singleton instance', () => {
      const a = getApiClient();
      const b = getApiClient();
      expect(a).toBe(b);
    });

    it('creates new instance after reset', () => {
      const a = getApiClient();
      resetApiClient();
      const b = getApiClient();
      expect(a).not.toBe(b);
    });
  });

  describe('resetApiClient', () => {
    it('clears the cached client', () => {
      const a = getApiClient();
      resetApiClient();
      const b = getApiClient();
      expect(a).not.toBe(b);
    });
  });

  describe('error interceptor', () => {
    it('transforms WooCommerce API errors', async () => {
      const client = createApiClient();

      // Simulate a WC API error response
      const mockError = {
        response: {
          status: 401,
          data: {
            code: 'woocommerce_rest_authentication_error',
            message: 'Invalid signature',
          },
        },
        request: {},
      };

      // Access the interceptor
      const interceptor = (client.interceptors.response as any).handlers[0];
      try {
        await interceptor.rejected(mockError);
      } catch (err: any) {
        expect(err.code).toBe('woocommerce_rest_authentication_error');
        expect(err.message).toBe('Invalid signature');
        expect(err.data.status).toBe(401);
      }
    });

    it('transforms network errors (no response)', async () => {
      const client = createApiClient();
      const mockError = {
        request: {},
        response: undefined,
      };

      const interceptor = (client.interceptors.response as any).handlers[0];
      try {
        await interceptor.rejected(mockError);
      } catch (err: any) {
        expect(err.code).toBe('NETWORK_ERROR');
        expect(err.message).toContain('Network request failed');
      }
    });

    it('transforms generic request errors', async () => {
      const client = createApiClient();
      const mockError = {
        message: 'Request setup failed',
        request: undefined,
        response: undefined,
      };

      const interceptor = (client.interceptors.response as any).handlers[0];
      try {
        await interceptor.rejected(mockError);
      } catch (err: any) {
        expect(err.code).toBe('REQUEST_ERROR');
        expect(err.message).toBe('Request setup failed');
      }
    });

    it('handles WC error without code/message', async () => {
      const client = createApiClient();
      const mockError = {
        response: {
          status: 500,
          data: {},
        },
        request: {},
      };

      const interceptor = (client.interceptors.response as any).handlers[0];
      try {
        await interceptor.rejected(mockError);
      } catch (err: any) {
        expect(err.code).toBe('UNKNOWN_ERROR');
        expect(err.message).toBe('An unknown error occurred');
      }
    });
  });
});
