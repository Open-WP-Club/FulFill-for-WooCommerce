import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSettingsStore} from '../../stores/settingsStore';

interface StockIndicatorProps {
  stockQuantity: number | null;
  stockStatus: string;
}

export function StockIndicator({stockQuantity, stockStatus}: StockIndicatorProps) {
  const lowStockThreshold = useSettingsStore(s => s.lowStockThreshold);

  const isOutOfStock = stockStatus === 'outofstock';
  const isLowStock =
    stockQuantity !== null && stockQuantity > 0 && stockQuantity <= lowStockThreshold;

  const color = isOutOfStock
    ? '#EF4444'
    : isLowStock
      ? '#F59E0B'
      : '#10B981';

  const label = isOutOfStock
    ? 'Out of stock'
    : stockQuantity !== null
      ? `Stock: ${stockQuantity}`
      : stockStatus;

  return (
    <View style={[styles.badge, {backgroundColor: color + '1A'}]}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={[styles.text, {color}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
