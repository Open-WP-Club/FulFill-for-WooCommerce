import {useCallback, useEffect, useRef} from 'react';
import {useOrdersStore} from '../stores/ordersStore';
import {useSettingsStore} from '../stores/settingsStore';
import {fetchOrders} from '../api/orders';
import type {WcOrderStatus} from '../types/order';

export function useOrders() {
  const {
    orders,
    orderedIds,
    totalPages,
    currentPage,
    isLoading,
    error,
    statusFilter,
    searchQuery,
    setOrders,
    appendOrders,
    setLoading,
    setError,
    setStatusFilter,
    setSearchQuery,
  } = useOrdersStore();

  const pollingIntervalMs = useSettingsStore(s => s.pollingIntervalMs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ordersList = orderedIds.map(id => orders[id]).filter(Boolean);

  const loadOrders = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);
      try {
        const status =
          statusFilter === 'all'
            ? undefined
            : (statusFilter as WcOrderStatus);
        const result = await fetchOrders({
          page,
          status,
          search: searchQuery || undefined,
        });

        if (page === 1) {
          setOrders(result.data, page, result.totalPages, result.totalItems);
        } else {
          appendOrders(result.data, page);
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? (err as {message: string}).message
            : 'Failed to load orders';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [
      statusFilter,
      searchQuery,
      setOrders,
      appendOrders,
      setLoading,
      setError,
    ],
  );

  const refresh = useCallback(() => loadOrders(1), [loadOrders]);

  const loadMore = useCallback(() => {
    if (!isLoading && currentPage < totalPages) {
      loadOrders(currentPage + 1);
    }
  }, [isLoading, currentPage, totalPages, loadOrders]);

  // Polling
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      loadOrders(1);
    }, pollingIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadOrders, pollingIntervalMs]);

  return {
    orders: ordersList,
    isLoading,
    error,
    statusFilter,
    searchQuery,
    totalPages,
    currentPage,
    refresh,
    loadMore,
    setStatusFilter,
    setSearchQuery,
  };
}
