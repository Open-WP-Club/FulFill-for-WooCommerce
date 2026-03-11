export interface WcAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WcLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  sku: string;
  price: number;
  subtotal: string;
  total: string;
  image: {
    id: number;
    src: string;
  };
  meta_data: WcMetaData[];
}

export interface WcMetaData {
  id: number;
  key: string;
  value: string;
}

export interface WcShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  total: string;
}

export interface WcOrderNote {
  id: number;
  author: string;
  date_created: string;
  note: string;
  customer_note: boolean;
}

export type WcOrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'trash';

export interface WcOrder {
  id: number;
  number: string;
  status: WcOrderStatus;
  date_created: string;
  date_modified: string;
  total: string;
  currency: string;
  customer_id: number;
  billing: WcAddress;
  shipping: WcAddress;
  line_items: WcLineItem[];
  shipping_lines: WcShippingLine[];
  payment_method: string;
  payment_method_title: string;
  customer_note: string;
  meta_data: WcMetaData[];
}
