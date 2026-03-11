export type PickItemStatus = 'pending' | 'picked' | 'missing' | 'damaged';

export interface PickItem {
  lineItemId: number;
  productId: number;
  name: string;
  sku: string;
  quantity: number;
  pickedQuantity: number;
  status: PickItemStatus;
  imageUrl?: string;
  notes?: string;
  photoUri?: string;
}

export interface PickSession {
  orderId: number;
  orderNumber: string;
  items: PickItem[];
  startedAt: string;
  completedAt?: string;
}
