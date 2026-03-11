import {getApiClient} from './client';
import type {WcProduct} from '../types/product';

export async function fetchProductBySku(sku: string): Promise<WcProduct | null> {
  const client = getApiClient();
  const response = await client.get<WcProduct[]>('/products', {
    params: {sku, per_page: 1},
  });
  return response.data.length > 0 ? response.data[0] : null;
}

export async function fetchProduct(productId: number): Promise<WcProduct> {
  const client = getApiClient();
  const response = await client.get<WcProduct>(`/products/${productId}`);
  return response.data;
}

export async function searchProducts(search: string): Promise<WcProduct[]> {
  const client = getApiClient();
  const response = await client.get<WcProduct[]>('/products', {
    params: {search, per_page: 10},
  });
  return response.data;
}
