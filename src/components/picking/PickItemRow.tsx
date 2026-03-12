import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StockIndicator} from './StockIndicator';
import {useProductStock} from '../../hooks/useProductStock';
import type {PickItem} from '../../types/picking';

interface PickItemRowProps {
  item: PickItem;
  onMarkMissing: () => void;
  onMarkDamaged: () => void;
}

const STATUS_ICONS: Record<string, {name: string; color: string}> = {
  pending: {name: 'radio-button-unchecked', color: '#9CA3AF'},
  picked: {name: 'check-circle', color: '#10B981'},
  missing: {name: 'error', color: '#F59E0B'},
  damaged: {name: 'broken-image', color: '#EF4444'},
};

export function PickItemRow({item, onMarkMissing, onMarkDamaged}: PickItemRowProps) {
  const icon = STATUS_ICONS[item.status];
  const {stockQuantity, stockStatus, isLoading} = useProductStock(item.productId);

  return (
    <View style={[styles.container, item.status === 'picked' && styles.picked]}>
      <Icon name={icon.name} size={24} color={icon.color} />
      {item.imageUrl ? (
        <Image source={{uri: item.imageUrl}} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        {item.sku ? <Text style={styles.sku}>SKU: {item.sku}</Text> : null}
        <Text style={styles.quantity}>
          {item.pickedQuantity} / {item.quantity}
        </Text>
        {!isLoading && (
          <StockIndicator stockQuantity={stockQuantity} stockStatus={stockStatus} />
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onMarkMissing} style={styles.actionBtn}>
          <Icon name="search-off" size={20} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMarkDamaged} style={styles.actionBtn}>
          <Icon name="broken-image" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  picked: {
    backgroundColor: '#F0FDF4',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  placeholder: {
    backgroundColor: '#F3F4F6',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  sku: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  quantity: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
});
