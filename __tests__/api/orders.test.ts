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

jest.mock('../../src/api/client', () => {
  const mockClient = {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  };
  return {
    getApiClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import {fetchOrders, fetchOrder, updateOrderStatus} from '../../src/api/orders';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {__mockClient: mockClient} = require('../../src/api/client');

describe('orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchOrders', () => {
    it('calls GET /orders with default params', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [{id: 1}, {id: 2}],
        headers: {'x-wp-totalpages': '3', 'x-wp-total': '50'},
      });

      const result = await fetchOrders();

      expect(mockClient.get).toHaveBeenCalledWith('/orders', {
        params: {page: 1, per_page: 20, status: undefined, search: undefined},
      });
      expect(result.data).toHaveLength(2);
      expect(result.totalPages).toBe(3);
      expect(result.totalItems).toBe(50);
      expect(result.currentPage).toBe(1);
    });

    it('passes status and search filters', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [],
        headers: {'x-wp-totalpages': '1', 'x-wp-total': '0'},
      });

      await fetchOrders({page: 2, perPage: 10, status: 'processing', search: 'john'});

      expect(mockClient.get).toHaveBeenCalledWith('/orders', {
        params: {page: 2, per_page: 10, status: 'processing', search: 'john'},
      });
    });

    it('handles missing pagination headers gracefully', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [{id: 1}],
        headers: {},
      });

      const result = await fetchOrders();
      expect(result.totalPages).toBe(1);
      expect(result.totalItems).toBe(0);
    });
  });

  describe('fetchOrder', () => {
    it('calls GET /orders/:id', async () => {
      const order = {id: 42, number: '42', status: 'processing'};
      mockClient.get.mockResolvedValueOnce({data: order});

      const result = await fetchOrder(42);

      expect(mockClient.get).toHaveBeenCalledWith('/orders/42');
      expect(result.id).toBe(42);
    });
  });

  describe('updateOrderStatus', () => {
    it('calls PUT /orders/:id with new status', async () => {
      const updated = {id: 42, status: 'completed'};
      mockClient.put.mockResolvedValueOnce({data: updated});

      const result = await updateOrderStatus(42, 'completed');

      expect(mockClient.put).toHaveBeenCalledWith('/orders/42', {status: 'completed'});
      expect(result.status).toBe('completed');
    });
  });
});
