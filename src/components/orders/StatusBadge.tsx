import React from 'react';
import {Badge} from '../common/Badge';
import type {WcOrderStatus} from '../../types/order';

const STATUS_COLORS: Record<WcOrderStatus, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  'on-hold': '#8B5CF6',
  completed: '#10B981',
  cancelled: '#6B7280',
  refunded: '#EF4444',
  failed: '#DC2626',
  trash: '#374151',
};

interface StatusBadgeProps {
  status: WcOrderStatus;
}

export function StatusBadge({status}: StatusBadgeProps) {
  return (
    <Badge
      label={status.replace('-', ' ')}
      color={STATUS_COLORS[status] ?? '#6B7280'}
    />
  );
}
