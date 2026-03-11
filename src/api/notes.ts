import {getApiClient} from './client';
import type {WcOrderNote} from '../types/order';

export async function fetchOrderNotes(orderId: number): Promise<WcOrderNote[]> {
  const client = getApiClient();
  const response = await client.get<WcOrderNote[]>(
    `/orders/${orderId}/notes`,
  );
  return response.data;
}

export async function addOrderNote(
  orderId: number,
  note: string,
  customerNote: boolean = false,
): Promise<WcOrderNote> {
  const client = getApiClient();
  const response = await client.post<WcOrderNote>(
    `/orders/${orderId}/notes`,
    {
      note,
      customer_note: customerNote,
    },
  );
  return response.data;
}
