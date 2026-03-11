import {
  formatCurrency,
  formatDate,
  formatShortDate,
  formatAddress,
  formatCustomerName,
} from '../../src/utils/formatters';
import type {WcAddress} from '../../src/types/order';

const makeAddress = (overrides: Partial<WcAddress> = {}): WcAddress => ({
  first_name: 'John',
  last_name: 'Doe',
  company: '',
  address_1: '123 Main St',
  address_2: '',
  city: 'Springfield',
  state: 'IL',
  postcode: '62701',
  country: 'US',
  ...overrides,
});

describe('formatCurrency', () => {
  it('formats USD', () => {
    expect(formatCurrency('29.99', 'USD')).toBe('$29.99');
  });

  it('formats EUR', () => {
    expect(formatCurrency('100.00', 'EUR')).toBe('€100.00');
  });

  it('formats GBP', () => {
    expect(formatCurrency('50.50', 'GBP')).toBe('£50.50');
  });

  it('formats BGN', () => {
    expect(formatCurrency('19.90', 'BGN')).toBe('лв19.90');
  });

  it('uses currency code for unknown currencies', () => {
    expect(formatCurrency('10.00', 'JPY')).toBe('JPY10.00');
  });

  it('handles integer amounts', () => {
    expect(formatCurrency('100', 'USD')).toBe('$100.00');
  });

  it('handles zero', () => {
    expect(formatCurrency('0', 'USD')).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2024-03-15T14:30:00');
    expect(result).toBe('15 Mar 2024, 14:30');
  });
});

describe('formatShortDate', () => {
  it('formats ISO date to short date', () => {
    const result = formatShortDate('2024-03-15T14:30:00');
    expect(result).toBe('15 Mar 2024');
  });
});

describe('formatAddress', () => {
  it('formats full address', () => {
    const address = makeAddress();
    const result = formatAddress(address);
    expect(result).toBe('123 Main St, Springfield, IL, 62701, US');
  });

  it('skips empty fields', () => {
    const address = makeAddress({address_2: '', state: ''});
    const result = formatAddress(address);
    expect(result).toBe('123 Main St, Springfield, 62701, US');
  });

  it('includes address_2 when present', () => {
    const address = makeAddress({address_2: 'Apt 4B'});
    const result = formatAddress(address);
    expect(result).toContain('Apt 4B');
  });
});

describe('formatCustomerName', () => {
  it('formats full name', () => {
    const address = makeAddress({first_name: 'Jane', last_name: 'Smith'});
    expect(formatCustomerName(address)).toBe('Jane Smith');
  });

  it('handles first name only', () => {
    const address = makeAddress({first_name: 'Jane', last_name: ''});
    expect(formatCustomerName(address)).toBe('Jane');
  });

  it('handles last name only', () => {
    const address = makeAddress({first_name: '', last_name: 'Smith'});
    expect(formatCustomerName(address)).toBe('Smith');
  });

  it('handles empty names', () => {
    const address = makeAddress({first_name: '', last_name: ''});
    expect(formatCustomerName(address)).toBe('');
  });
});
