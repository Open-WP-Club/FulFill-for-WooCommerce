import {matchBarcodeToLineItem, matchBarcodeToProduct, isToteBarcode} from '../../src/utils/barcode';
import type {WcLineItem} from '../../src/types/order';
import type {WcProduct} from '../../src/types/product';

const makeLineItem = (overrides: Partial<WcLineItem> = {}): WcLineItem => ({
  id: 1,
  name: 'Test Product',
  product_id: 100,
  variation_id: 0,
  quantity: 2,
  sku: 'SKU-001',
  price: 10,
  subtotal: '20.00',
  total: '20.00',
  image: {id: 1, src: ''},
  meta_data: [],
  ...overrides,
});

const makeProduct = (overrides: Partial<WcProduct> = {}): WcProduct => ({
  id: 100,
  name: 'Test Product',
  slug: 'test-product',
  sku: 'SKU-001',
  price: '10.00',
  regular_price: '10.00',
  sale_price: '',
  stock_quantity: 5,
  stock_status: 'instock',
  images: [],
  meta_data: [],
  ...overrides,
});

describe('matchBarcodeToLineItem', () => {
  it('matches by SKU (exact)', () => {
    const items = [makeLineItem({sku: 'ABC-123'})];
    const result = matchBarcodeToLineItem('ABC-123', items);
    expect(result).toBe(items[0]);
  });

  it('matches by SKU case-insensitively', () => {
    const items = [makeLineItem({sku: 'abc-123'})];
    const result = matchBarcodeToLineItem('ABC-123', items);
    expect(result).toBe(items[0]);
  });

  it('matches by _barcode meta key', () => {
    const items = [
      makeLineItem({
        sku: 'DIFFERENT',
        meta_data: [{id: 1, key: '_barcode', value: '4006381333931'}],
      }),
    ];
    const result = matchBarcodeToLineItem('4006381333931', items);
    expect(result).toBe(items[0]);
  });

  it('matches by _ean meta key', () => {
    const items = [
      makeLineItem({
        sku: 'DIFFERENT',
        meta_data: [{id: 1, key: '_ean', value: '4006381333931'}],
      }),
    ];
    const result = matchBarcodeToLineItem('4006381333931', items);
    expect(result).toBe(items[0]);
  });

  it('matches by _gtin meta key', () => {
    const items = [
      makeLineItem({
        sku: 'X',
        meta_data: [{id: 1, key: '_gtin', value: '00012345600012'}],
      }),
    ];
    const result = matchBarcodeToLineItem('00012345600012', items);
    expect(result).toBe(items[0]);
  });

  it('matches by _upc meta key', () => {
    const items = [
      makeLineItem({
        sku: 'X',
        meta_data: [{id: 1, key: '_upc', value: '012345678905'}],
      }),
    ];
    const result = matchBarcodeToLineItem('012345678905', items);
    expect(result).toBe(items[0]);
  });

  it('prefers SKU match over meta match', () => {
    const skuItem = makeLineItem({id: 1, sku: '4006381333931'});
    const metaItem = makeLineItem({
      id: 2,
      sku: 'OTHER',
      meta_data: [{id: 1, key: '_barcode', value: '4006381333931'}],
    });
    const result = matchBarcodeToLineItem('4006381333931', [skuItem, metaItem]);
    expect(result).toBe(skuItem);
  });

  it('returns null when no match found', () => {
    const items = [makeLineItem({sku: 'ABC-123'})];
    const result = matchBarcodeToLineItem('NO-MATCH', items);
    expect(result).toBeNull();
  });

  it('returns null for empty line items', () => {
    const result = matchBarcodeToLineItem('ABC-123', []);
    expect(result).toBeNull();
  });

  it('skips items with empty SKU', () => {
    const items = [makeLineItem({sku: ''})];
    const result = matchBarcodeToLineItem('', items);
    expect(result).toBeNull();
  });

  it('matches correct item among multiple', () => {
    const items = [
      makeLineItem({id: 1, sku: 'AAA'}),
      makeLineItem({id: 2, sku: 'BBB'}),
      makeLineItem({id: 3, sku: 'CCC'}),
    ];
    const result = matchBarcodeToLineItem('BBB', items);
    expect(result?.id).toBe(2);
  });
});

describe('matchBarcodeToProduct', () => {
  it('matches by SKU', () => {
    const products = [makeProduct({sku: 'PROD-SKU'})];
    const result = matchBarcodeToProduct('PROD-SKU', products);
    expect(result).toBe(products[0]);
  });

  it('matches by SKU case-insensitively', () => {
    const products = [makeProduct({sku: 'prod-sku'})];
    const result = matchBarcodeToProduct('PROD-SKU', products);
    expect(result).toBe(products[0]);
  });

  it('matches by _barcode meta key', () => {
    const products = [
      makeProduct({
        sku: 'DIFFERENT',
        meta_data: [{id: 1, key: '_barcode', value: '4006381333931'}],
      }),
    ];
    const result = matchBarcodeToProduct('4006381333931', products);
    expect(result).toBe(products[0]);
  });

  it('returns null when no match', () => {
    const products = [makeProduct({sku: 'ABC'})];
    const result = matchBarcodeToProduct('XYZ', products);
    expect(result).toBeNull();
  });

  it('returns null for empty products array', () => {
    const result = matchBarcodeToProduct('ABC', []);
    expect(result).toBeNull();
  });
});

describe('isToteBarcode', () => {
  it('returns true for TOTE- prefixed barcodes', () => {
    expect(isToteBarcode('TOTE-A1')).toBe(true);
    expect(isToteBarcode('TOTE-123')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isToteBarcode('tote-a1')).toBe(true);
    expect(isToteBarcode('Tote-B2')).toBe(true);
  });

  it('returns false for non-tote barcodes', () => {
    expect(isToteBarcode('SKU-001')).toBe(false);
    expect(isToteBarcode('4006381333931')).toBe(false);
    expect(isToteBarcode('TOTEM-123')).toBe(false);
    expect(isToteBarcode('')).toBe(false);
  });
});
