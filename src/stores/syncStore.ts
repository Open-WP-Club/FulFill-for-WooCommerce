import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {v4 as uuidv4} from 'uuid';
import {zustandMMKVStorage} from '../utils/storage';
import type {QueuedMutation, MutationType} from '../types/sync';
import {updateOrderStatus} from '../api/orders';
import {addOrderNote} from '../api/notes';
import {updateProductStock} from '../api/inventory';
import type {WcOrderStatus} from '../types/order';

interface SyncStoreState {
  queue: QueuedMutation[];
  isSyncing: boolean;
  lastSyncAt: string | null;

  enqueue: (type: MutationType, payload: Record<string, unknown>) => void;
  dequeue: (id: string) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncStoreState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      lastSyncAt: null,

      enqueue: (type, payload) => {
        const mutation: QueuedMutation = {
          id: uuidv4(),
          type,
          payload,
          createdAt: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 5,
        };
        set(state => ({queue: [...state.queue, mutation]}));
      },

      dequeue: (id: string) => {
        set(state => ({queue: state.queue.filter(m => m.id !== id)}));
      },

      processQueue: async () => {
        const {queue, isSyncing} = get();
        if (isSyncing || queue.length === 0) {
          return;
        }

        set({isSyncing: true});

        const toRemove = new Set<string>();
        const retryIncrements = new Map<string, number>();

        for (const mutation of queue) {
          try {
            await executeMutation(mutation);
            toRemove.add(mutation.id);
          } catch {
            const nextRetry = (mutation.retryCount ?? 0) + 1;
            retryIncrements.set(mutation.id, nextRetry);
            if (nextRetry >= mutation.maxRetries) {
              toRemove.add(mutation.id);
            }
          }
        }

        set(state => ({
          queue: state.queue
            .filter(m => !toRemove.has(m.id))
            .map(m => {
              const nextRetry = retryIncrements.get(m.id);
              return nextRetry !== undefined ? {...m, retryCount: nextRetry} : m;
            }),
          isSyncing: false,
          lastSyncAt: new Date().toISOString(),
        }));
      },

      clearQueue: () => set({queue: [], isSyncing: false}),
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: state => ({queue: state.queue}),
    },
  ),
);

async function executeMutation(mutation: QueuedMutation): Promise<void> {
  switch (mutation.type) {
    case 'UPDATE_ORDER_STATUS':
      await updateOrderStatus(
        mutation.payload.orderId as number,
        mutation.payload.status as WcOrderStatus,
      );
      break;
    case 'ADD_ORDER_NOTE':
      await addOrderNote(
        mutation.payload.orderId as number,
        mutation.payload.note as string,
        (mutation.payload.customerNote as boolean) ?? false,
      );
      break;
    case 'UPDATE_TRACKING':
      // Tracking updates require a WC plugin — enqueue as note for now
      await addOrderNote(
        mutation.payload.orderId as number,
        `Tracking: ${mutation.payload.trackingNumber as string}`,
        false,
      );
      break;
    case 'UPDATE_STOCK':
      await updateProductStock(
        mutation.payload.productId as number,
        mutation.payload.quantity as number,
      );
      break;
  }
}
