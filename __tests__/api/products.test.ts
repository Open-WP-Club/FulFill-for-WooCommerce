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
  };
  return {
    getApiClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import {fetchProductBySku, fetchProduct, searchProducts} from '../../src/api/products';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {__mockClient: mockClient} = require('../../src/api/client');

describe('products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProductBySku', () => {
    it('returns product when found', async () => {
      const product = {id: 1, sku: 'ABC-123', name: 'Widget'};
      mockClient.get.mockResolvedValueOnce({data: [product]});

      const result = await fetchProductBySku('ABC-123');

      expect(mockClient.get).toHaveBeenCalledWith('/products', {
        params: {sku: 'ABC-123', per_page: 1},
      });
      expect(result).toEqual(product);
    });

    it('returns null when no product found', async () => {
      mockClient.get.mockResolvedValueOnce({data: []});

      const result = await fetchProductBySku('NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('fetchProduct', () => {
    it('calls GET /products/:id', async () => {
      const product = {id: 99, name: 'Gadget'};
      mockClient.get.mockResolvedValueOnce({data: product});

      const result = await fetchProduct(99);

      expect(mockClient.get).toHaveBeenCalledWith('/products/99');
      expect(result.id).toBe(99);
    });
  });

  describe('searchProducts', () => {
    it('searches with per_page 10', async () => {
      mockClient.get.mockResolvedValueOnce({data: [{id: 1}, {id: 2}]});

      const result = await searchProducts('widget');

      expect(mockClient.get).toHaveBeenCalledWith('/products', {
        params: {search: 'widget', per_page: 10},
      });
      expect(result).toHaveLength(2);
    });
  });
});
