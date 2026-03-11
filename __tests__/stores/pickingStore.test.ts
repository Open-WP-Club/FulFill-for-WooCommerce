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

import {usePickingStore} from '../../src/stores/pickingStore';
import type {WcOrder} from '../../src/types/order';

const makeOrder = (): WcOrder =>
  ({
    id: 42,
    number: '42',
    status: 'processing',
    date_created: '2024-01-01T00:00:00',
    date_modified: '2024-01-01T00:00:00',
    total: '100.00',
    currency: 'USD',
    customer_id: 1,
    billing: {} as WcOrder['billing'],
    shipping: {} as WcOrder['shipping'],
    line_items: [
      {
        id: 101,
        name: 'Widget A',
        product_id: 1001,
        variation_id: 0,
        quantity: 3,
        sku: 'WID-A',
        price: 10,
        subtotal: '30.00',
        total: '30.00',
        image: {id: 1, src: 'http://img.jpg'},
        meta_data: [],
      },
      {
        id: 102,
        name: 'Widget B',
        product_id: 1002,
        variation_id: 0,
        quantity: 1,
        sku: 'WID-B',
        price: 70,
        subtotal: '70.00',
        total: '70.00',
        image: {id: 2, src: ''},
        meta_data: [],
      },
    ],
    shipping_lines: [],
    payment_method: 'cod',
    payment_method_title: 'Cash on delivery',
    customer_note: '',
    meta_data: [],
  }) as WcOrder;

describe('pickingStore', () => {
  beforeEach(() => {
    usePickingStore.getState().endSession();
  });

  describe('startSession', () => {
    it('creates a session from an order', () => {
      usePickingStore.getState().startSession(makeOrder());
      const session = usePickingStore.getState().activeSession;

      expect(session).not.toBeNull();
      expect(session!.orderId).toBe(42);
      expect(session!.orderNumber).toBe('42');
      expect(session!.items).toHaveLength(2);
      expect(session!.startedAt).toBeTruthy();
    });

    it('initializes items with pending status and zero picked', () => {
      usePickingStore.getState().startSession(makeOrder());
      const items = usePickingStore.getState().activeSession!.items;

      expect(items[0].status).toBe('pending');
      expect(items[0].pickedQuantity).toBe(0);
      expect(items[0].sku).toBe('WID-A');
      expect(items[0].quantity).toBe(3);
    });
  });

  describe('endSession', () => {
    it('clears the active session', () => {
      usePickingStore.getState().startSession(makeOrder());
      usePickingStore.getState().endSession();
      expect(usePickingStore.getState().activeSession).toBeNull();
    });
  });

  describe('incrementPicked', () => {
    it('increments picked quantity by 1', () => {
      usePickingStore.getState().startSession(makeOrder());
      usePickingStore.getState().incrementPicked(101);

      const item = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 101)!;
      expect(item.pickedQuantity).toBe(1);
      expect(item.status).toBe('pending');
    });

    it('marks as picked when quantity is reached', () => {
      usePickingStore.getState().startSession(makeOrder());
      // Widget B has quantity 1
      usePickingStore.getState().incrementPicked(102);

      const item = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 102)!;
      expect(item.pickedQuantity).toBe(1);
      expect(item.status).toBe('picked');
    });

    it('does not exceed quantity', () => {
      usePickingStore.getState().startSession(makeOrder());
      // Widget B has quantity 1, pick twice
      usePickingStore.getState().incrementPicked(102);
      usePickingStore.getState().incrementPicked(102);

      const item = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 102)!;
      expect(item.pickedQuantity).toBe(1);
    });

    it('handles multiple increments for multi-quantity items', () => {
      usePickingStore.getState().startSession(makeOrder());
      // Widget A has quantity 3
      usePickingStore.getState().incrementPicked(101);
      usePickingStore.getState().incrementPicked(101);

      const item = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 101)!;
      expect(item.pickedQuantity).toBe(2);
      expect(item.status).toBe('pending');

      usePickingStore.getState().incrementPicked(101);
      const finalItem = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 101)!;
      expect(finalItem.pickedQuantity).toBe(3);
      expect(finalItem.status).toBe('picked');
    });
  });

  describe('updateItemStatus', () => {
    it('marks item as missing', () => {
      usePickingStore.getState().startSession(makeOrder());
      usePickingStore.getState().updateItemStatus(101, 'missing');

      const item = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 101)!;
      expect(item.status).toBe('missing');
    });

    it('marks item as damaged', () => {
      usePickingStore.getState().startSession(makeOrder());
      usePickingStore.getState().updateItemStatus(102, 'damaged');

      const item = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 102)!;
      expect(item.status).toBe('damaged');
    });
  });

  describe('setItemNote', () => {
    it('sets a note on an item', () => {
      usePickingStore.getState().startSession(makeOrder());
      usePickingStore.getState().setItemNote(101, 'Box is dented');

      const item = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 101)!;
      expect(item.notes).toBe('Box is dented');
    });
  });

  describe('setItemPhoto', () => {
    it('sets a photo URI on an item', () => {
      usePickingStore.getState().startSession(makeOrder());
      usePickingStore
        .getState()
        .setItemPhoto(101, 'file:///photo.jpg');

      const item = usePickingStore
        .getState()
        .activeSession!.items.find(i => i.lineItemId === 101)!;
      expect(item.photoUri).toBe('file:///photo.jpg');
    });
  });

  describe('isSessionComplete', () => {
    it('returns false when items are pending', () => {
      usePickingStore.getState().startSession(makeOrder());
      expect(usePickingStore.getState().isSessionComplete()).toBe(false);
    });

    it('returns true when all items are picked', () => {
      usePickingStore.getState().startSession(makeOrder());
      // Pick all Widget A (qty 3)
      usePickingStore.getState().incrementPicked(101);
      usePickingStore.getState().incrementPicked(101);
      usePickingStore.getState().incrementPicked(101);
      // Pick Widget B (qty 1)
      usePickingStore.getState().incrementPicked(102);

      expect(usePickingStore.getState().isSessionComplete()).toBe(true);
    });

    it('returns true when items are picked, missing, or damaged', () => {
      usePickingStore.getState().startSession(makeOrder());
      usePickingStore.getState().updateItemStatus(101, 'missing');
      usePickingStore.getState().updateItemStatus(102, 'damaged');

      expect(usePickingStore.getState().isSessionComplete()).toBe(true);
    });

    it('returns false with no session', () => {
      expect(usePickingStore.getState().isSessionComplete()).toBe(false);
    });
  });
});
