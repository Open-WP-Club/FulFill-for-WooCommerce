import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {Card} from '../common/Card';
import {StatusBadge} from './StatusBadge';
import {formatCurrency, formatDate, formatCustomerName} from '../../utils/formatters';
import {useTheme} from '../../theme/ThemeContext';
import {copyToClipboard} from '../../utils/clipboard';
import type {WcOrder} from '../../types/order';

interface OrderCardProps {
  order: WcOrder;
  onPress: () => void;
}

export function OrderCard({order, onPress}: OrderCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => copyToClipboard(order.number, `Order #${order.number}`)}
      activeOpacity={0.7}>
      <Card>
        <View style={styles.header}>
          <Text style={[styles.orderNumber, {color: theme.textPrimary}]}>
            #{order.number}
          </Text>
          <StatusBadge status={order.status} />
        </View>
        <Text style={[styles.customer, {color: theme.textSecondary}]}>
          {formatCustomerName(order.billing)}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.date, {color: theme.textMuted}]}>
            {formatDate(order.date_created)}
          </Text>
          <Text style={[styles.total, {color: theme.textPrimary}]}>
            {formatCurrency(order.total, order.currency)}
          </Text>
        </View>
        <Text style={[styles.items, {color: theme.textMuted}]}>
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
  },
  customer: {
    fontSize: 15,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
  },
  items: {
    fontSize: 13,
    marginTop: 4,
  },
});
