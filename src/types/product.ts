export interface WcProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  images: WcProductImage[];
  meta_data: WcProductMeta[];
  barcode?: string;
}

export interface WcProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WcProductMeta {
  id: number;
  key: string;
  value: string;
}
