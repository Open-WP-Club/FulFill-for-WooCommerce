import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StockIndicator} from './StockIndicator';
import {useProductStock} from '../../hooks/useProductStock';
import {useTheme} from '../../theme/ThemeContext';
import type {PickItem} from '../../types/picking';

interface PickItemRowProps {
  item: PickItem;
  onMarkMissing: () => void;
  onMarkDamaged: () => void;
}

export function PickItemRow({item, onMarkMissing, onMarkDamaged}: PickItemRowProps) {
  const theme = useTheme();
  const icon = {
    pending: {name: 'radio-button-unchecked', color: theme.textMuted},
    picked: {name: 'check-circle', color: theme.success},
    missing: {name: 'error', color: theme.warning},
    damaged: {name: 'broken-image', color: theme.error},
  }[item.status];
  const {stockQuantity, stockStatus, isLoading} = useProductStock(item.productId);

  return (
    <View
      style={[
        styles.container,
        {borderBottomColor: theme.borderLight},
        item.status === 'picked' && {backgroundColor: theme.successBg},
      ]}>
      <Icon name={icon.name} size={24} color={icon.color} />
      {item.imageUrl ? (
        <Image source={{uri: item.imageUrl}} style={styles.image} />
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
          <Text style={[styles.sku, {color: theme.textMuted}]}>SKU: {item.sku}</Text>
        ) : null}
        <Text style={[styles.quantity, {color: theme.textTertiary}]}>
          {item.pickedQuantity} / {item.quantity}
        </Text>
        {!isLoading && (
          <StockIndicator stockQuantity={stockQuantity} stockStatus={stockStatus} />
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onMarkMissing} style={styles.actionBtn}>
          <Icon name="search-off" size={20} color={theme.warning} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMarkDamaged} style={styles.actionBtn}>
          <Icon name="broken-image" size={20} color={theme.error} />
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
    gap: 12,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
  },
  sku: {
    fontSize: 12,
    marginTop: 2,
  },
  quantity: {
    fontSize: 13,
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
