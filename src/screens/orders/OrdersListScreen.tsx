import React, {useEffect, useCallback} from 'react';
import {View, FlatList, StyleSheet, TextInput} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OrderCard} from '../../components/orders/OrderCard';
import {FilterBar} from '../../components/orders/FilterBar';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import {EmptyState} from '../../components/common/EmptyState';
import {OfflineBanner} from '../../components/common/OfflineBanner';
import {useOrders} from '../../hooks/useOrders';
import {useTheme} from '../../theme/ThemeContext';
import type {OrdersStackParamList} from '../../types/navigation';
import type {WcOrder} from '../../types/order';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;

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

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]);

  const handleOrderPress = useCallback(
    (order: WcOrder) => {
      navigation.navigate('OrderDetail', {orderId: order.id});
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: WcOrder}) => (
      <OrderCard order={item} onPress={() => handleOrderPress(item)} />
    ),
    [handleOrderPress],
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <OfflineBanner />
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
      <FilterBar
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        counts={statusCounts}
      />
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
          data={orders}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onRefresh={refresh}
          refreshing={isLoading}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.list}
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
});
