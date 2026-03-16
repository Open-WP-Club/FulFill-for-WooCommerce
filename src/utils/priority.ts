import type {WcOrder} from '../types/order';

export type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low';

export interface OrderPriority {
  level: PriorityLevel;
  score: number;
  reasons: string[];
}

const MS_PER_HOUR = 3600_000;
const MS_PER_DAY = 86_400_000;

export function computeOrderPriority(order: WcOrder): OrderPriority {
  let score = 0;
  const reasons: string[] = [];
  const now = Date.now();
  const created = new Date(order.date_created).getTime();
  const ageMs = now - created;
  const ageDays = ageMs / MS_PER_DAY;

  // Age-based scoring (older = higher priority)
  if (ageDays > 3) {
    score += 40;
    reasons.push(`${Math.floor(ageDays)}d old`);
  } else if (ageDays > 1) {
    score += 20;
    reasons.push(`${Math.floor(ageDays)}d old`);
  } else if (ageMs > 6 * MS_PER_HOUR) {
    score += 10;
  }

  // Shipping method hints (express/priority/overnight)
  const shippingMethod = order.shipping_lines
    .map(s => s.method_title.toLowerCase())
    .join(' ');
  if (
    shippingMethod.includes('express') ||
    shippingMethod.includes('priority') ||
    shippingMethod.includes('overnight') ||
    shippingMethod.includes('next day') ||
    shippingMethod.includes('rush')
  ) {
    score += 30;
    reasons.push('Express shipping');
  }

  // High-value orders get slight bump
  const total = parseFloat(order.total);
  if (total >= 200) {
    score += 15;
    reasons.push('High value');
  } else if (total >= 100) {
    score += 5;
  }

  // Customer note = needs attention
  if (order.customer_note) {
    score += 10;
    reasons.push('Has note');
  }

  // Status-based (processing should be picked before on-hold/pending)
  if (order.status === 'processing') {
    score += 5;
  }

  // Determine level
  let level: PriorityLevel;
  if (score >= 50) {
    level = 'urgent';
  } else if (score >= 30) {
    level = 'high';
  } else if (score >= 10) {
    level = 'normal';
  } else {
    level = 'low';
  }

  return {level, score, reasons};
}

export function sortOrdersByPriority(orders: WcOrder[]): WcOrder[] {
  return [...orders].sort((a, b) => {
    const pa = computeOrderPriority(a);
    const pb = computeOrderPriority(b);
    return pb.score - pa.score;
  });
}

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  urgent: '#EF4444',
  high: '#F59E0B',
  normal: '#3B82F6',
  low: '#6B7280',
};
