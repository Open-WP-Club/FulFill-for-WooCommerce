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

import {useOrdersStore} from '../../src/stores/ordersStore';
import type {WcOrder} from '../../src/types/order';

const makeOrder = (id: number, overrides: Partial<WcOrder> = {}): WcOrder =>
  ({
    id,
    number: `${id}`,
    status: 'processing',
    date_created: '2024-01-01T00:00:00',
    date_modified: '2024-01-01T00:00:00',
    total: '100.00',
    currency: 'USD',
    customer_id: 1,
    billing: {} as WcOrder['billing'],
    shipping: {} as WcOrder['shipping'],
    line_items: [],
    shipping_lines: [],
    payment_method: 'stripe',
    payment_method_title: 'Stripe',
    customer_note: '',
    meta_data: [],
    ...overrides,
  }) as WcOrder;

describe('ordersStore', () => {
  beforeEach(() => {
    const store = useOrdersStore.getState();
    store.setOrders([], 1, 1, 0);
    store.setLoading(false);
    store.setError(null);
    store.setStatusFilter('all');
    store.setSearchQuery('');
  });

  describe('setOrders', () => {
    it('normalizes orders into map and ids', () => {
      const orders = [makeOrder(1), makeOrder(2), makeOrder(3)];
      useOrdersStore.getState().setOrders(orders, 1, 2, 50);

      const state = useOrdersStore.getState();
      expect(state.orderedIds).toEqual([1, 2, 3]);
      expect(state.orders[1].id).toBe(1);
      expect(state.orders[2].id).toBe(2);
      expect(state.orders[3].id).toBe(3);
      expect(state.currentPage).toBe(1);
      expect(state.totalPages).toBe(2);
      expect(state.totalItems).toBe(50);
    });

    it('replaces previous orders', () => {
      useOrdersStore.getState().setOrders([makeOrder(1)], 1, 1, 1);
      useOrdersStore.getState().setOrders([makeOrder(5)], 1, 1, 1);

      const state = useOrdersStore.getState();
      expect(state.orderedIds).toEqual([5]);
      expect(state.orders[1]).toBeUndefined();
      expect(state.orders[5].id).toBe(5);
    });
  });

  describe('appendOrders', () => {
    it('appends orders without duplicating', () => {
      useOrdersStore.getState().setOrders([makeOrder(1), makeOrder(2)], 1, 3, 30);
      useOrdersStore.getState().appendOrders([makeOrder(2), makeOrder(3)], 2);

      const state = useOrdersStore.getState();
      expect(state.orderedIds).toEqual([1, 2, 3]);
      expect(state.currentPage).toBe(2);
    });
  });

  describe('updateOrder', () => {
    it('updates a single order in the map', () => {
      useOrdersStore.getState().setOrders([makeOrder(1)], 1, 1, 1);
      useOrdersStore
        .getState()
        .updateOrder(makeOrder(1, {status: 'completed'}));

      expect(useOrdersStore.getState().orders[1].status).toBe('completed');
    });

    it('does not affect orderedIds', () => {
      useOrdersStore.getState().setOrders([makeOrder(1)], 1, 1, 1);
      useOrdersStore
        .getState()
        .updateOrder(makeOrder(1, {status: 'completed'}));

      expect(useOrdersStore.getState().orderedIds).toEqual([1]);
    });
  });

  describe('filters', () => {
    it('sets status filter', () => {
      useOrdersStore.getState().setStatusFilter('processing');
      expect(useOrdersStore.getState().statusFilter).toBe('processing');
    });

    it('sets search query', () => {
      useOrdersStore.getState().setSearchQuery('john');
      expect(useOrdersStore.getState().searchQuery).toBe('john');
    });
  });

  describe('loading & error', () => {
    it('sets loading state', () => {
      useOrdersStore.getState().setLoading(true);
      expect(useOrdersStore.getState().isLoading).toBe(true);
    });

    it('sets error state', () => {
      useOrdersStore.getState().setError('Network error');
      expect(useOrdersStore.getState().error).toBe('Network error');
    });

    it('clears error', () => {
      useOrdersStore.getState().setError('err');
      useOrdersStore.getState().setError(null);
      expect(useOrdersStore.getState().error).toBeNull();
    });
  });
});
