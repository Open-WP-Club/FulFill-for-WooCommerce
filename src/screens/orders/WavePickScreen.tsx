import React, {useMemo, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-icons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {useTheme} from '../../theme/ThemeContext';
import {playSuccessFeedback, playStatusFeedback} from '../../utils/feedback';
import {copyToClipboard} from '../../utils/clipboard';
import {batchUpdateOrderStatus} from '../../api/orders';
import {useOrdersStore} from '../../stores/ordersStore';
import type {OrdersStackParamList} from '../../types/navigation';
import type {WaveGroup} from '../../utils/wavePicking';
import {buildWaveGroups} from '../../utils/wavePicking';

type Props = NativeStackScreenProps<OrdersStackParamList, 'WavePick'>;

export function WavePickScreen({route, navigation}: Props) {
  const theme = useTheme();
  const {orders} = route.params;
  const updateOrderInStore = useOrdersStore(s => s.updateOrder);

  const groups = useMemo(() => buildWaveGroups(orders), [orders]);

  const [pickedSkus, setPickedSkus] = useState<Set<string>>(new Set());

  const totalItems = groups.reduce((sum, g) => sum + g.totalQuantity, 0);
  const pickedItems = groups
    .filter(g => pickedSkus.has(g.sku || `pid-${g.productId}`))
    .reduce((sum, g) => sum + g.totalQuantity, 0);

  const togglePicked = useCallback((group: WaveGroup) => {
    const key = group.sku || `pid-${group.productId}`;
    setPickedSkus(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        playSuccessFeedback();
      }
      return next;
    });
  }, []);

  const handleCompleteWave = useCallback(() => {
    const unpicked = groups.filter(
      g => !pickedSkus.has(g.sku || `pid-${g.productId}`),
    );

    const doComplete = async () => {
      const orderIds = orders.map(o => o.id);
      for (const o of orders) {
        updateOrderInStore({...o, status: 'completed'});
      }
      playStatusFeedback('completed');
      try {
        await batchUpdateOrderStatus(orderIds, 'completed');
      } catch {
        // Rollback on failure
        for (const o of orders) {
          updateOrderInStore(o);
        }
      }
      navigation.goBack();
    };

    if (unpicked.length > 0) {
      Alert.alert(
        'Incomplete Wave',
        `${unpicked.length} SKU${unpicked.length !== 1 ? 's' : ''} not yet picked. Complete anyway?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Complete', onPress: doComplete},
        ],
      );
    } else {
      doComplete();
    }
  }, [groups, pickedSkus, orders, updateOrderInStore, navigation]);

  const renderGroup = useCallback(
    ({item}: {item: WaveGroup}) => {
      const key = item.sku || `pid-${item.productId}`;
      const isPicked = pickedSkus.has(key);

      return (
        <TouchableOpacity onPress={() => togglePicked(item)}>
          <View
            style={[
              styles.groupRow,
              {borderBottomColor: theme.borderLight},
              isPicked && {backgroundColor: theme.successBg},
            ]}>
            <Icon
              name={isPicked ? 'check-circle' : 'radio-button-unchecked'}
              size={24}
              color={isPicked ? theme.success : theme.textMuted}
            />
            {item.imageUrl ? (
              <Image source={{uri: item.imageUrl}} style={styles.image} />
            ) : (
              <View
                style={[
                  styles.image,
                  {backgroundColor: theme.surfaceSecondary},
                ]}
              />
            )}
            <View style={styles.groupInfo}>
              <Text
                style={[styles.groupName, {color: theme.textPrimary}]}
                numberOfLines={2}>
                {item.productName}
              </Text>
              {item.sku ? (
                <Text
                  style={[styles.groupSku, {color: theme.textMuted}]}
                  onLongPress={() => copyToClipboard(item.sku, 'SKU')}>
                  SKU: {item.sku}
                </Text>
              ) : null}
              <View style={styles.groupMeta}>
                <Text style={[styles.groupQty, {color: theme.primary}]}>
                  x{item.totalQuantity}
                </Text>
                <Text style={[styles.groupOrders, {color: theme.textTertiary}]}>
                  {item.orders.length} order
                  {item.orders.length !== 1 ? 's' : ''}
                  {' · '}
                  {item.orders.map(o => `#${o.orderNumber}`).join(', ')}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [pickedSkus, togglePicked, theme],
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <Card>
        <View style={styles.summary}>
          <View>
            <Text style={[styles.summaryLabel, {color: theme.textMuted}]}>
              Orders
            </Text>
            <Text style={[styles.summaryValue, {color: theme.textPrimary}]}>
              {orders.length}
            </Text>
          </View>
          <View>
            <Text style={[styles.summaryLabel, {color: theme.textMuted}]}>
              Unique SKUs
            </Text>
            <Text style={[styles.summaryValue, {color: theme.textPrimary}]}>
              {groups.length}
            </Text>
          </View>
          <View>
            <Text style={[styles.summaryLabel, {color: theme.textMuted}]}>
              Total Items
            </Text>
            <Text style={[styles.summaryValue, {color: theme.textPrimary}]}>
              {totalItems}
            </Text>
          </View>
          <View>
            <Text style={[styles.summaryLabel, {color: theme.textMuted}]}>
              Picked
            </Text>
            <Text style={[styles.summaryValue, {color: theme.success}]}>
              {pickedItems}/{totalItems}
            </Text>
          </View>
        </View>
      </Card>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBg, {backgroundColor: theme.border}]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${totalItems > 0 ? (pickedItems / totalItems) * 100 : 0}%`,
                backgroundColor: theme.success,
              },
            ]}
          />
        </View>
      </View>

      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={item => item.sku || `pid-${item.productId}`}
        style={styles.list}
      />

      <View
        style={[
          styles.footer,
          {backgroundColor: theme.surface, borderTopColor: theme.border},
        ]}>
        <Button
          title="Complete Wave"
          onPress={handleCompleteWave}
          style={styles.footerBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  list: {
    flex: 1,
  },
  groupRow: {
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
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '500',
  },
  groupSku: {
    fontSize: 12,
    marginTop: 2,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  groupQty: {
    fontSize: 14,
    fontWeight: '700',
  },
  groupOrders: {
    fontSize: 11,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerBtn: {
    width: '100%',
  },
});
