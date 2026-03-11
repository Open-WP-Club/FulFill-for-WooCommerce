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

jest.mock('../../src/api/orders', () => ({
  updateOrderStatus: jest.fn(),
}));

jest.mock('../../src/api/notes', () => ({
  addOrderNote: jest.fn(),
}));

import {useSyncStore} from '../../src/stores/syncStore';
import {updateOrderStatus} from '../../src/api/orders';
import {addOrderNote} from '../../src/api/notes';

const mockUpdateOrderStatus = updateOrderStatus as jest.MockedFunction<
  typeof updateOrderStatus
>;
const mockAddOrderNote = addOrderNote as jest.MockedFunction<
  typeof addOrderNote
>;

describe('syncStore', () => {
  beforeEach(() => {
    useSyncStore.getState().clearQueue();
    jest.clearAllMocks();
  });

  describe('enqueue', () => {
    it('adds a mutation to the queue', () => {
      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {
        orderId: 1,
        status: 'completed',
      });

      const queue = useSyncStore.getState().queue;
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe('UPDATE_ORDER_STATUS');
      expect(queue[0].payload.orderId).toBe(1);
      expect(queue[0].retryCount).toBe(0);
      expect(queue[0].maxRetries).toBe(5);
    });

    it('assigns unique IDs', () => {
      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {orderId: 1, status: 'completed'});
      useSyncStore.getState().enqueue('ADD_ORDER_NOTE', {orderId: 2, note: 'test'});

      const queue = useSyncStore.getState().queue;
      expect(queue).toHaveLength(2);
      expect(queue[0].id).not.toBe(queue[1].id);
    });

    it('preserves FIFO order', () => {
      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {orderId: 1, status: 'completed'});
      useSyncStore.getState().enqueue('ADD_ORDER_NOTE', {orderId: 2, note: 'hello'});
      useSyncStore.getState().enqueue('UPDATE_TRACKING', {orderId: 3, trackingNumber: 'TRK123'});

      const queue = useSyncStore.getState().queue;
      expect(queue[0].type).toBe('UPDATE_ORDER_STATUS');
      expect(queue[1].type).toBe('ADD_ORDER_NOTE');
      expect(queue[2].type).toBe('UPDATE_TRACKING');
    });
  });

  describe('dequeue', () => {
    it('removes a specific mutation by ID', () => {
      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {orderId: 1, status: 'completed'});
      const id = useSyncStore.getState().queue[0].id;

      useSyncStore.getState().dequeue(id);
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });
  });

  describe('processQueue', () => {
    it('processes UPDATE_ORDER_STATUS mutations', async () => {
      mockUpdateOrderStatus.mockResolvedValueOnce({} as any);

      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {
        orderId: 42,
        status: 'completed',
      });

      await useSyncStore.getState().processQueue();

      expect(mockUpdateOrderStatus).toHaveBeenCalledWith(42, 'completed');
      expect(useSyncStore.getState().queue).toHaveLength(0);
      expect(useSyncStore.getState().isSyncing).toBe(false);
      expect(useSyncStore.getState().lastSyncAt).toBeTruthy();
    });

    it('processes ADD_ORDER_NOTE mutations', async () => {
      mockAddOrderNote.mockResolvedValueOnce({} as any);

      useSyncStore.getState().enqueue('ADD_ORDER_NOTE', {
        orderId: 42,
        note: 'Test note',
        customerNote: false,
      });

      await useSyncStore.getState().processQueue();

      expect(mockAddOrderNote).toHaveBeenCalledWith(42, 'Test note', false);
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it('processes UPDATE_TRACKING as note', async () => {
      mockAddOrderNote.mockResolvedValueOnce({} as any);

      useSyncStore.getState().enqueue('UPDATE_TRACKING', {
        orderId: 42,
        trackingNumber: 'TRK-123',
      });

      await useSyncStore.getState().processQueue();

      expect(mockAddOrderNote).toHaveBeenCalledWith(
        42,
        'Tracking: TRK-123',
        false,
      );
    });

    it('increments retry count on failure', async () => {
      mockUpdateOrderStatus.mockRejectedValueOnce(new Error('Network error'));

      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {
        orderId: 1,
        status: 'completed',
      });

      await useSyncStore.getState().processQueue();

      const queue = useSyncStore.getState().queue;
      expect(queue).toHaveLength(1);
      expect(queue[0].retryCount).toBe(1);
    });

    it('removes mutation after max retries', async () => {
      mockUpdateOrderStatus.mockRejectedValue(new Error('fail'));

      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {
        orderId: 1,
        status: 'completed',
      });

      // Set retryCount to maxRetries - 1 so next failure removes it
      const queue = useSyncStore.getState().queue;
      queue[0].retryCount = 4;
      useSyncStore.setState({queue: [...queue]});

      await useSyncStore.getState().processQueue();

      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it('does not process if already syncing', async () => {
      useSyncStore.setState({isSyncing: true});
      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {orderId: 1, status: 'completed'});

      await useSyncStore.getState().processQueue();

      expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
      // Reset for cleanup
      useSyncStore.setState({isSyncing: false});
    });

    it('does nothing with empty queue', async () => {
      await useSyncStore.getState().processQueue();
      expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
      expect(mockAddOrderNote).not.toHaveBeenCalled();
    });
  });

  describe('clearQueue', () => {
    it('clears all mutations and resets syncing', () => {
      useSyncStore.getState().enqueue('UPDATE_ORDER_STATUS', {orderId: 1, status: 'completed'});
      useSyncStore.getState().enqueue('ADD_ORDER_NOTE', {orderId: 2, note: 'hi'});

      useSyncStore.getState().clearQueue();

      expect(useSyncStore.getState().queue).toHaveLength(0);
      expect(useSyncStore.getState().isSyncing).toBe(false);
    });
  });
});
