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
    post: jest.fn(),
  };
  return {
    getApiClient: () => mockClient,
    __mockClient: mockClient,
  };
});

import {fetchOrderNotes, addOrderNote} from '../../src/api/notes';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {__mockClient: mockClient} = require('../../src/api/client');

describe('notes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchOrderNotes', () => {
    it('calls GET /orders/:id/notes', async () => {
      const notes = [{id: 1, note: 'Shipped'}];
      mockClient.get.mockResolvedValueOnce({data: notes});

      const result = await fetchOrderNotes(42);

      expect(mockClient.get).toHaveBeenCalledWith('/orders/42/notes');
      expect(result).toEqual(notes);
    });
  });

  describe('addOrderNote', () => {
    it('posts a private note by default', async () => {
      const note = {id: 10, note: 'Internal note', customer_note: false};
      mockClient.post.mockResolvedValueOnce({data: note});

      const result = await addOrderNote(42, 'Internal note');

      expect(mockClient.post).toHaveBeenCalledWith('/orders/42/notes', {
        note: 'Internal note',
        customer_note: false,
      });
      expect(result.note).toBe('Internal note');
    });

    it('can post a customer note', async () => {
      const note = {id: 11, note: 'Your order shipped', customer_note: true};
      mockClient.post.mockResolvedValueOnce({data: note});

      await addOrderNote(42, 'Your order shipped', true);

      expect(mockClient.post).toHaveBeenCalledWith('/orders/42/notes', {
        note: 'Your order shipped',
        customer_note: true,
      });
    });
  });
});
