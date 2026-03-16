import React, {useEffect, useCallback, useState, useRef, useMemo} from 'react';
import {View, FlatList, StyleSheet, TextInput, Alert, TouchableOpacity, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OrderCard} from '../../components/orders/OrderCard';
import {FilterBar} from '../../components/orders/FilterBar';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import {EmptyState} from '../../components/common/EmptyState';
import {OfflineBanner} from '../../components/common/OfflineBanner';
import {useOrders} from '../../hooks/useOrders';
import {useShakeUndo} from '../../hooks/useShakeUndo';
import {useTheme} from '../../theme/ThemeContext';
import {batchUpdateOrderStatus} from '../../api/orders';
import {playStatusFeedback} from '../../utils/feedback';
import {useOrdersStore} from '../../stores/ordersStore';
import type {OrdersStackParamList} from '../../types/navigation';
import {sortOrdersByPriority} from '../../utils/priority';
import {suggestWaves} from '../../utils/wavePicking';
import type {WcOrder, WcOrderStatus} from '../../types/order';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;

const BATCH_ACTIONS: Array<{label: string; status: WcOrderStatus; icon: string}> = [
  {label: 'Processing', status: 'processing', icon: 'autorenew'},
  {label: 'Complete', status: 'completed', icon: 'check-circle'},
  {label: 'On Hold', status: 'on-hold', icon: 'pause-circle-filled'},
  {label: 'Cancel', status: 'cancelled', icon: 'cancel'},
];

export function OrdersListScreen({navigation}: Props) {
  const theme = useTheme();
  const {
    orders,
    isLoading,
    statusFilter,
    searchQuery,
    statusCounts,
    refresh,
    loadMore,
    setStatusFilter,
    setSearchQuery,
  } = useOrders();

  const updateOrderInStore = useOrdersStore(s => s.updateOrder);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [prioritySort, setPrioritySort] = useState(false);
  const lastBatchRef = useRef<{ids: number[]; previousStatuses: Map<number, WcOrderStatus>} | null>(null);

  const selectMode = selectedIds.size > 0;

  const sortedOrders = useMemo(
    () => (prioritySort ? sortOrdersByPriority(orders) : orders),
    [orders, prioritySort],
  );

  const handleStartWave = useCallback(() => {
    // Use selected orders if any, otherwise use actionable orders
    const waveOrders = selectMode
      ? orders.filter(o => selectedIds.has(o.id))
      : orders.filter(
          o => o.status === 'processing' || o.status === 'pending',
        );

    if (waveOrders.length < 2) {
      Alert.alert(
        'Wave Pick',
        'Select at least 2 orders for wave picking, or ensure there are 2+ processing/pending orders.',
      );
      return;
    }

    const waves = suggestWaves(waveOrders);
    if (waves.length > 0) {
      setSelectedIds(new Set());
      navigation.navigate('WavePick', {orders: waves[0].orders});
    }
  }, [selectMode, orders, selectedIds, navigation]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]);

  // Clear selection when filter changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [statusFilter, searchQuery]);

  const handleOrderPress = useCallback(
    (order: WcOrder) => {
      navigation.navigate('OrderDetail', {orderId: order.id});
    },
    [navigation],
  );

  const toggleSelect = useCallback((orderId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const handleCompleteOrder = useCallback(
    (order: WcOrder) => {
      Alert.alert(
        'Complete Order',
        `Mark order #${order.number} as completed?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Complete',
            onPress: async () => {
              const prev = order.status;
              updateOrderInStore({...order, status: 'completed'});
              playStatusFeedback('completed');
              lastBatchRef.current = {
                ids: [order.id],
                previousStatuses: new Map([[order.id, prev]]),
              };
              try {
                await batchUpdateOrderStatus([order.id], 'completed');
              } catch {
                updateOrderInStore({...order, status: prev});
              }
            },
          },
        ],
      );
    },
    [updateOrderInStore],
  );

  const handleBatchAction = useCallback(
    (status: WcOrderStatus) => {
      const ids = Array.from(selectedIds);
      const count = ids.length;
      Alert.alert(
        'Batch Update',
        `Set ${count} order${count !== 1 ? 's' : ''} to "${status}"?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Confirm',
            onPress: async () => {
              // Save previous statuses for undo
              const previousStatuses = new Map<number, WcOrderStatus>();
              const storeState = useOrdersStore.getState();
              for (const id of ids) {
                const o = storeState.orders[id];
                if (o) {
                  previousStatuses.set(id, o.status);
                  updateOrderInStore({...o, status});
                }
              }
              lastBatchRef.current = {ids, previousStatuses};
              playStatusFeedback(status);
              setSelectedIds(new Set());

              setBatchLoading(true);
              try {
                await batchUpdateOrderStatus(ids, status);
              } catch {
                // Rollback
                for (const [id, prev] of previousStatuses) {
                  const o = useOrdersStore.getState().orders[id];
                  if (o) {
                    updateOrderInStore({...o, status: prev});
                  }
                }
              } finally {
                setBatchLoading(false);
              }
            },
          },
        ],
      );
    },
    [selectedIds, updateOrderInStore],
  );

  // Shake to undo last batch/status action
  useShakeUndo({
    onUndo: () => {
      const last = lastBatchRef.current;
      if (!last) {
        return;
      }
      const storeState = useOrdersStore.getState();
      for (const [id, prev] of last.previousStatuses) {
        const o = storeState.orders[id];
        if (o) {
          updateOrderInStore({...o, status: prev});
        }
      }
      batchUpdateOrderStatus(
        last.ids,
        // Restore first previous status as representative
        last.previousStatuses.values().next().value!,
      ).catch(() => {});
      lastBatchRef.current = null;
    },
    label: 'Undo last status change?',
    enabled: !!lastBatchRef.current,
  });

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(orders.map(o => o.id)));
  }, [orders]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const renderItem = useCallback(
    ({item}: {item: WcOrder}) => (
      <OrderCard
        order={item}
        onPress={() => handleOrderPress(item)}
        onComplete={() => handleCompleteOrder(item)}
        selected={selectedIds.has(item.id)}
        onToggleSelect={() => toggleSelect(item.id)}
        selectMode={selectMode}
      />
    ),
    [handleOrderPress, handleCompleteOrder, selectedIds, toggleSelect, selectMode],
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <OfflineBanner />

      {selectMode && (
        <View style={[styles.batchBar, {backgroundColor: theme.surface, borderBottomColor: theme.border}]}>
          <View style={styles.batchLeft}>
            <TouchableOpacity onPress={clearSelection} style={styles.batchClose}>
              <Icon name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.batchCount, {color: theme.textPrimary}]}>
              {selectedIds.size} selected
            </Text>
            <TouchableOpacity onPress={selectAll}>
              <Text style={[styles.selectAllText, {color: theme.primary}]}>
                Select All
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.batchActions}>
            {BATCH_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.status}
                style={[styles.batchBtn, {backgroundColor: theme.surfaceSecondary}]}
                onPress={() => handleBatchAction(action.status)}
                disabled={batchLoading}>
                <Icon name={action.icon} size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TextInput
        style={[
          styles.search,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.border,
            color: theme.inputText,
          },
        ]}
        placeholder="Search orders..."
        placeholderTextColor={theme.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
      />
      <View style={styles.toolbar}>
        <FilterBar
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          counts={statusCounts}
        />
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={[
              styles.toolBtn,
              {backgroundColor: prioritySort ? theme.primary : theme.surfaceSecondary},
            ]}
            onPress={() => setPrioritySort(p => !p)}>
            <Icon
              name="sort"
              size={18}
              color={prioritySort ? theme.textOnPrimary : theme.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, {backgroundColor: theme.surfaceSecondary}]}
            onPress={handleStartWave}>
            <Icon name="layers" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
      {isLoading && orders.length === 0 ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No orders found"
          message="Try adjusting your filters"
        />
      ) : (
        <FlatList
          data={sortedOrders}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onRefresh={refresh}
          refreshing={isLoading}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.list}
          extraData={selectedIds}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  list: {
    paddingVertical: 8,
  },
  batchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  batchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  batchClose: {
    padding: 4,
  },
  batchCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  batchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  batchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
