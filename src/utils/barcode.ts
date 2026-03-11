import type {WcLineItem} from '../types/order';
import type {WcProduct} from '../types/product';

const BARCODE_META_KEYS = ['_barcode', '_ean', '_gtin', '_upc'];

export function matchBarcodeToLineItem(
  barcode: string,
  lineItems: WcLineItem[],
): WcLineItem | null {
  // Try SKU match first
  const skuMatch = lineItems.find(
    item => item.sku && item.sku.toLowerCase() === barcode.toLowerCase(),
  );
  if (skuMatch) {
    return skuMatch;
  }

  // Try meta_data match
  for (const item of lineItems) {
    for (const meta of item.meta_data) {
      if (
        BARCODE_META_KEYS.includes(meta.key) &&
        meta.value.toLowerCase() === barcode.toLowerCase()
      ) {
        return item;
      }
    }
  }

  return null;
}

export function matchBarcodeToProduct(
  barcode: string,
  products: WcProduct[],
): WcProduct | null {
  // Try SKU match first
  const skuMatch = products.find(
    p => p.sku && p.sku.toLowerCase() === barcode.toLowerCase(),
  );
  if (skuMatch) {
    return skuMatch;
  }

  // Try meta_data match
  for (const product of products) {
    for (const meta of product.meta_data) {
      if (
        BARCODE_META_KEYS.includes(meta.key) &&
        meta.value.toLowerCase() === barcode.toLowerCase()
      ) {
        return product;
      }
    }
  }

  return null;
}
