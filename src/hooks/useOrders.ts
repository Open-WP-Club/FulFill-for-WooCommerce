import {useCallback, useEffect, useRef, useState} from 'react';
import {useOrdersStore} from '../stores/ordersStore';
import {useSettingsStore} from '../stores/settingsStore';
import {fetchOrders, fetchOrderCounts, type StatusCounts} from '../api/orders';
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
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});

  const ordersList = orderedIds.map(id => orders[id]).filter(Boolean);

  const loadCounts = useCallback(async () => {
    try {
      const counts = await fetchOrderCounts();
      setStatusCounts(counts);
    } catch {
      // silently ignore count errors
    }
  }, []);

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

  const refresh = useCallback(() => {
    loadOrders(1);
    loadCounts();
  }, [loadOrders, loadCounts]);

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
      loadCounts();
    }, pollingIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadOrders, loadCounts, pollingIntervalMs]);

  return {
    orders: ordersList,
    isLoading,
    error,
    statusFilter,
    searchQuery,
    statusCounts,
    totalPages,
    currentPage,
    refresh,
    loadMore,
    setStatusFilter,
    setSearchQuery,
  };
}
