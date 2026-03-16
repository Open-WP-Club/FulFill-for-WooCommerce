import {computeOrderPriority, sortOrdersByPriority} from '../../src/utils/priority';
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

function makeOrder(overrides: Partial<WcOrder> = {}): WcOrder {
  return {
    id: 1,
    number: '1001',
    status: 'processing',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    total: '50.00',
    currency: 'USD',
    customer_id: 1,
    billing: baseAddress,
    shipping: baseAddress,
    line_items: [],
    shipping_lines: [],
    payment_method: 'stripe',
    payment_method_title: 'Card',
    customer_note: '',
    meta_data: [],
    ...overrides,
  };
}

describe('computeOrderPriority', () => {
  it('returns low priority for a fresh simple order', () => {
    const order = makeOrder();
    const result = computeOrderPriority(order);
    // processing gives +5, fresh order gives nothing else
    expect(result.level).toBe('low');
    expect(result.score).toBe(5);
  });

  it('bumps priority for old orders (>3 days)', () => {
    const fourDaysAgo = new Date(Date.now() - 4 * 86_400_000).toISOString();
    const result = computeOrderPriority(makeOrder({date_created: fourDaysAgo}));
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.reasons[0]).toMatch(/\dd old/);
    expect(['high', 'urgent']).toContain(result.level);
  });

  it('bumps priority for express shipping', () => {
    const result = computeOrderPriority(
      makeOrder({
        shipping_lines: [{id: 1, method_title: 'Express Shipping', method_id: 'express', total: '10.00'}],
      }),
    );
    expect(result.score).toBeGreaterThanOrEqual(30);
    expect(result.reasons).toContain('Express shipping');
  });

  it('bumps priority for high-value orders', () => {
    const result = computeOrderPriority(makeOrder({total: '250.00'}));
    expect(result.reasons).toContain('High value');
  });

  it('bumps priority for orders with customer notes', () => {
    const result = computeOrderPriority(makeOrder({customer_note: 'Please gift wrap'}));
    expect(result.reasons).toContain('Has note');
  });

  it('returns urgent for combined high factors', () => {
    const result = computeOrderPriority(
      makeOrder({
        date_created: new Date(Date.now() - 5 * 86_400_000).toISOString(),
        total: '300.00',
        customer_note: 'Rush please',
        shipping_lines: [{id: 1, method_title: 'Overnight', method_id: 'overnight', total: '25.00'}],
      }),
    );
    expect(result.level).toBe('urgent');
    expect(result.score).toBeGreaterThanOrEqual(50);
  });
});

describe('sortOrdersByPriority', () => {
  it('sorts highest priority first', () => {
    const low = makeOrder({id: 1, total: '10.00', status: 'pending'});
    const high = makeOrder({
      id: 2,
      date_created: new Date(Date.now() - 5 * 86_400_000).toISOString(),
      shipping_lines: [{id: 1, method_title: 'Express', method_id: 'express', total: '10.00'}],
    });
    const sorted = sortOrdersByPriority([low, high]);
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(1);
  });
});
