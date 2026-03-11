import {useState, useCallback, useEffect} from 'react';
import {useOrdersStore} from '../stores/ordersStore';
import {fetchOrder, updateOrderStatus} from '../api/orders';
import {fetchOrderNotes, addOrderNote} from '../api/notes';
import {useSyncStore} from '../stores/syncStore';
import {useNetworkStatus} from './useNetworkStatus';
import type {WcOrder, WcOrderStatus, WcOrderNote} from '../types/order';

export function useOrderDetail(orderId: number) {
  const order = useOrdersStore(s => s.orders[orderId]);
  const updateOrderInStore = useOrdersStore(s => s.updateOrder);
  const enqueue = useSyncStore(s => s.enqueue);
  const {isConnected} = useNetworkStatus();

  const [notes, setNotes] = useState<WcOrderNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const [freshOrder, orderNotes] = await Promise.all([
        fetchOrder(orderId),
        fetchOrderNotes(orderId),
      ]);
      updateOrderInStore(freshOrder);
      setNotes(orderNotes);
      setError(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as {message: string}).message
          : 'Failed to load order';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, updateOrderInStore]);

  const changeStatus = useCallback(
    async (status: WcOrderStatus) => {
      if (!order) {
        return;
      }

      // Optimistic update
      const previousOrder = order;
      updateOrderInStore({...order, status});

      if (isConnected) {
        try {
          const updated = await updateOrderStatus(orderId, status);
          updateOrderInStore(updated);
        } catch {
          // Rollback and queue
          updateOrderInStore(previousOrder);
          enqueue('UPDATE_ORDER_STATUS', {orderId, status});
        }
      } else {
        enqueue('UPDATE_ORDER_STATUS', {orderId, status});
      }
    },
    [order, orderId, isConnected, updateOrderInStore, enqueue],
  );

  const addNote = useCallback(
    async (noteText: string, customerNote: boolean = false) => {
      if (isConnected) {
        try {
          const newNote = await addOrderNote(orderId, noteText, customerNote);
          setNotes(prev => [newNote, ...prev]);
        } catch {
          enqueue('ADD_ORDER_NOTE', {
            orderId,
            note: noteText,
            customerNote,
          });
        }
      } else {
        enqueue('ADD_ORDER_NOTE', {orderId, note: noteText, customerNote});
      }
    },
    [orderId, isConnected, enqueue],
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  return {
    order: order as WcOrder | undefined,
    notes,
    isLoading,
    error,
    refresh: loadOrder,
    changeStatus,
    addNote,
  };
}
