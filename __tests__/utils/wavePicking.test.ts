import {buildWaveGroups, suggestWaves} from '../../src/utils/wavePicking';
import type {WcOrder} from '../../src/types/order';

const baseAddress = {
  first_name: 'John',
  last_name: 'Doe',
  company: '',
  address_1: '123 Main St',
  address_2: '',
  city: 'Test',
  state: 'TS',
  postcode: '12345',
  country: 'US',
};

function makeLineItem(sku: string, qty: number, productId = 100) {
  return {
    id: Math.random() * 10000 | 0,
    name: `Product ${sku}`,
    product_id: productId,
    variation_id: 0,
    quantity: qty,
    sku,
    price: 10,
    subtotal: (qty * 10).toString(),
    total: (qty * 10).toString(),
    image: {id: 1, src: ''},
    meta_data: [],
  };
}

function makeOrder(id: number, items: ReturnType<typeof makeLineItem>[]): WcOrder {
  return {
    id,
    number: `100${id}`,
    status: 'processing',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    total: '50.00',
    currency: 'USD',
    customer_id: 1,
    billing: baseAddress,
    shipping: baseAddress,
    line_items: items,
    shipping_lines: [],
    payment_method: 'stripe',
    payment_method_title: 'Card',
    customer_note: '',
    meta_data: [],
  };
}

describe('buildWaveGroups', () => {
  it('consolidates same SKU across orders', () => {
    const orders = [
      makeOrder(1, [makeLineItem('ABC', 2)]),
      makeOrder(2, [makeLineItem('ABC', 3)]),
    ];
    const groups = buildWaveGroups(orders);
    expect(groups).toHaveLength(1);
    expect(groups[0].sku).toBe('ABC');
    expect(groups[0].totalQuantity).toBe(5);
    expect(groups[0].orders).toHaveLength(2);
  });

  it('keeps different SKUs separate', () => {
    const orders = [
      makeOrder(1, [makeLineItem('ABC', 1), makeLineItem('DEF', 2)]),
    ];
    const groups = buildWaveGroups(orders);
    expect(groups).toHaveLength(2);
  });

  it('sorts groups by order count descending', () => {
    const orders = [
      makeOrder(1, [makeLineItem('RARE', 1), makeLineItem('COMMON', 1)]),
      makeOrder(2, [makeLineItem('COMMON', 2)]),
      makeOrder(3, [makeLineItem('COMMON', 1)]),
    ];
    const groups = buildWaveGroups(orders);
    expect(groups[0].sku).toBe('COMMON');
    expect(groups[0].orders).toHaveLength(3);
  });

  it('uses product_id as key when SKU is empty', () => {
    const orders = [
      makeOrder(1, [makeLineItem('', 1, 42)]),
      makeOrder(2, [makeLineItem('', 2, 42)]),
    ];
    const groups = buildWaveGroups(orders);
    expect(groups).toHaveLength(1);
    expect(groups[0].totalQuantity).toBe(3);
  });
});

describe('suggestWaves', () => {
  it('returns empty array for no orders', () => {
    expect(suggestWaves([])).toEqual([]);
  });

  it('groups orders with shared SKUs into same wave', () => {
    const orders = [
      makeOrder(1, [makeLineItem('A', 1), makeLineItem('B', 1)]),
      makeOrder(2, [makeLineItem('A', 2)]),
      makeOrder(3, [makeLineItem('C', 1)]),
    ];
    const waves = suggestWaves(orders);
    // Orders 1 and 2 share SKU 'A', order 3 has no overlap
    expect(waves.length).toBeGreaterThanOrEqual(1);
    const firstWave = waves.find(w => w.commonSkuCount > 0);
    expect(firstWave).toBeDefined();
    expect(firstWave!.orders.some(o => o.id === 1)).toBe(true);
    expect(firstWave!.orders.some(o => o.id === 2)).toBe(true);
  });

  it('respects maxPerWave limit', () => {
    const orders = Array.from({length: 15}, (_, i) =>
      makeOrder(i + 1, [makeLineItem('SHARED', 1)]),
    );
    const waves = suggestWaves(orders, 5);
    for (const wave of waves) {
      expect(wave.orders.length).toBeLessThanOrEqual(5);
    }
  });
});
