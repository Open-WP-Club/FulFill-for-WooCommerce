import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {Card} from '../common/Card';
import {StatusBadge} from './StatusBadge';
import {formatCurrency, formatDate, formatCustomerName} from '../../utils/formatters';
import type {WcOrder} from '../../types/order';

interface OrderCardProps {
  order: WcOrder;
  onPress: () => void;
}

export function OrderCard({order, onPress}: OrderCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card>
        <View style={styles.header}>
          <Text style={styles.orderNumber}>#{order.number}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Text style={styles.customer}>
          {formatCustomerName(order.billing)}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(order.date_created)}</Text>
          <Text style={styles.total}>
            {formatCurrency(order.total, order.currency)}
          </Text>
        </View>
        <Text style={styles.items}>
          {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  customer: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  items: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
