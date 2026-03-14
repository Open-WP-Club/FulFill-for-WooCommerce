import {getApiClient} from './client';
import type {WcOrder, WcOrderStatus} from '../types/order';
import type {PaginatedResponse} from '../types/api';

interface FetchOrdersParams {
  page?: number;
  perPage?: number;
  status?: WcOrderStatus | WcOrderStatus[];
  search?: string;
}

export async function fetchOrders(
  params: FetchOrdersParams = {},
): Promise<PaginatedResponse<WcOrder>> {
  const client = getApiClient();
  const response = await client.get<WcOrder[]>('/orders', {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? 20,
      status: params.status,
      search: params.search,
    },
  });

  return {
    data: response.data,
    totalPages: parseInt(response.headers['x-wp-totalpages'] ?? '1', 10),
    totalItems: parseInt(response.headers['x-wp-total'] ?? '0', 10),
    currentPage: params.page ?? 1,
  };
}

export async function fetchOrder(orderId: number): Promise<WcOrder> {
  const client = getApiClient();
  const response = await client.get<WcOrder>(`/orders/${orderId}`);
  return response.data;
}

export async function updateOrderStatus(
  orderId: number,
  status: WcOrderStatus,
): Promise<WcOrder> {
  const client = getApiClient();
  const response = await client.put<WcOrder>(`/orders/${orderId}`, {status});
  return response.data;
}

export type StatusCounts = Partial<Record<WcOrderStatus | 'all', number>>;

export async function fetchOrderCounts(): Promise<StatusCounts> {
  const client = getApiClient();
  const statuses: WcOrderStatus[] = [
    'processing',
    'on-hold',
    'pending',
    'completed',
  ];

  const results = await Promise.all(
    statuses.map(status =>
      client
        .get('/orders', {params: {status, per_page: 1}})
        .then(res => ({
          status,
          count: parseInt(res.headers['x-wp-total'] ?? '0', 10),
        })),
    ),
  );

  const counts: StatusCounts = {};
  let total = 0;
  for (const {status, count} of results) {
    counts[status] = count;
    total += count;
  }
  counts.all = total;

  return counts;
}
