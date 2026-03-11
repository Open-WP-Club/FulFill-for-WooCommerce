import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../utils/storage';
import type {WcOrder, WcOrderStatus} from '../types/order';

interface OrdersState {
  orders: Record<number, WcOrder>;
  orderedIds: number[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;

  // Filters
  statusFilter: WcOrderStatus | 'all';
  searchQuery: string;

  setOrders: (
    orders: WcOrder[],
    page: number,
    totalPages: number,
    totalItems: number,
  ) => void;
  appendOrders: (orders: WcOrder[], page: number) => void;
  updateOrder: (order: WcOrder) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStatusFilter: (status: WcOrderStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    set => ({
      orders: {},
      orderedIds: [],
      totalPages: 1,
      totalItems: 0,
      currentPage: 1,
      isLoading: false,
      error: null,
      statusFilter: 'all',
      searchQuery: '',

      setOrders: (orders, page, totalPages, totalItems) => {
        const ordersMap: Record<number, WcOrder> = {};
        const ids: number[] = [];
        for (const order of orders) {
          ordersMap[order.id] = order;
          ids.push(order.id);
        }
        set({
          orders: ordersMap,
          orderedIds: ids,
          currentPage: page,
          totalPages,
          totalItems,
          error: null,
        });
      },

      appendOrders: (orders, page) => {
        set(state => {
          const updatedOrders = {...state.orders};
          const newIds = [...state.orderedIds];
          for (const order of orders) {
            updatedOrders[order.id] = order;
            if (!newIds.includes(order.id)) {
              newIds.push(order.id);
            }
          }
          return {
            orders: updatedOrders,
            orderedIds: newIds,
            currentPage: page,
          };
        });
      },

      updateOrder: order => {
        set(state => ({
          orders: {...state.orders, [order.id]: order},
        }));
      },

      setLoading: loading => set({isLoading: loading}),
      setError: error => set({error}),
      setStatusFilter: status => set({statusFilter: status}),
      setSearchQuery: query => set({searchQuery: query}),
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: state => ({
        orders: state.orders,
        orderedIds: state.orderedIds,
      }),
    },
  ),
);
