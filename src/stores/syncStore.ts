import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {v4 as uuidv4} from 'uuid';
import {zustandMMKVStorage} from '../utils/storage';
import type {QueuedMutation, MutationType} from '../types/sync';
import {updateOrderStatus} from '../api/orders';
import {addOrderNote} from '../api/notes';
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

        const updatedQueue = [...queue];
        const toRemove: string[] = [];

        for (const mutation of updatedQueue) {
          try {
            await executeMutation(mutation);
            toRemove.push(mutation.id);
          } catch {
            mutation.retryCount += 1;
            if (mutation.retryCount >= mutation.maxRetries) {
              mutation.lastError = 'Max retries exceeded';
              toRemove.push(mutation.id);
            }
          }
        }

        set(state => ({
          queue: state.queue.filter(m => !toRemove.includes(m.id)),
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
  }
}
