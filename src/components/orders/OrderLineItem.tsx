import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {formatCurrency} from '../../utils/formatters';
import {useTheme} from '../../theme/ThemeContext';
import type {WcLineItem} from '../../types/order';

interface OrderLineItemProps {
  item: WcLineItem;
  currency: string;
}

export function OrderLineItem({item, currency}: OrderLineItemProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, {borderBottomColor: theme.borderLight}]}>
      {item.image?.src ? (
        <Image source={{uri: item.image.src}} style={styles.image} />
      ) : (
        <View
          style={[styles.image, {backgroundColor: theme.surfaceSecondary}]}
        />
      )}
      <View style={styles.info}>
        <Text style={[styles.name, {color: theme.textPrimary}]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.sku ? (
          <Text style={[styles.sku, {color: theme.textMuted}]}>
            SKU: {item.sku}
          </Text>
        ) : null}
        <View style={styles.row}>
          <Text style={[styles.quantity, {color: theme.textTertiary}]}>
            Qty: {item.quantity}
          </Text>
          <Text style={[styles.price, {color: theme.textPrimary}]}>
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
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  sku: {
    fontSize: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
});
