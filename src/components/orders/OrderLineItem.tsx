import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {formatCurrency} from '../../utils/formatters';
import type {WcLineItem} from '../../types/order';

interface OrderLineItemProps {
  item: WcLineItem;
  currency: string;
}

export function OrderLineItem({item, currency}: OrderLineItemProps) {
  return (
    <View style={styles.container}>
      {item.image?.src ? (
        <Image source={{uri: item.image.src}} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        {item.sku ? <Text style={styles.sku}>SKU: {item.sku}</Text> : null}
        <View style={styles.row}>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
          <Text style={styles.price}>
            {formatCurrency(item.total, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholder: {
    backgroundColor: '#F3F4F6',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  sku: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
