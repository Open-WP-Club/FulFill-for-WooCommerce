import {getApiClient} from './client';
import type {WcProduct} from '../types/product';

export async function fetchProductStock(
  productId: number,
): Promise<{stock_quantity: number | null; stock_status: string}> {
  const client = getApiClient();
  const response = await client.get<WcProduct>(`/products/${productId}`);
  return {
    stock_quantity: response.data.stock_quantity,
    stock_status: response.data.stock_status,
  };
}

export async function updateProductStock(
  productId: number,
  quantity: number,
): Promise<WcProduct> {
  const client = getApiClient();
  const response = await client.put<WcProduct>(`/products/${productId}`, {
    stock_quantity: quantity,
  });
  return response.data;
}
