import {format, parseISO} from 'date-fns';
import type {WcAddress} from '../types/order';

export function formatCurrency(amount: string, currency: string): string {
  const num = parseFloat(amount);
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    BGN: 'лв',
  };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${num.toFixed(2)}`;
}

export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), 'dd MMM yyyy, HH:mm');
}

export function formatShortDate(isoDate: string): string {
  return format(parseISO(isoDate), 'dd MMM yyyy');
}

export function formatAddress(address: WcAddress): string {
  const parts = [
    address.address_1,
    address.address_2,
    address.city,
    address.state,
    address.postcode,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export function formatCustomerName(address: WcAddress): string {
  return `${address.first_name} ${address.last_name}`.trim();
}
