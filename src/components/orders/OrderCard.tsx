import React, {useCallback, useRef} from 'react';
import {TouchableOpacity, View, Text, StyleSheet, Animated} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Card} from '../common/Card';
import {StatusBadge} from './StatusBadge';
import {formatCurrency, formatDate, formatCustomerName} from '../../utils/formatters';
import {useTheme} from '../../theme/ThemeContext';
import {copyToClipboard} from '../../utils/clipboard';
import type {WcOrder} from '../../types/order';

interface OrderCardProps {
  order: WcOrder;
  onPress: () => void;
  onComplete?: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  selectMode?: boolean;
}

export function OrderCard({
  order,
  onPress,
  onComplete,
  selected = false,
  onToggleSelect,
  selectMode = false,
}: OrderCardProps) {
  const theme = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
    ) => {
      const scale = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0.5],
        extrapolate: 'clamp',
      });

      return (
        <TouchableOpacity
          style={styles.swipeAction}
          onPress={() => {
            swipeableRef.current?.close();
            onPress();
          }}>
          <Animated.View
            style={[styles.swipeContent, {transform: [{scale}]}]}>
            <Icon name="visibility" size={22} color="#fff" />
            <Text style={styles.swipeText}>View</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    },
    [onPress],
  );

  const renderLeftActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
    ) => {
      if (!onComplete || order.status === 'completed') {
        return null;
      }

      const scale = dragX.interpolate({
        inputRange: [0, 80],
        outputRange: [0.5, 1],
        extrapolate: 'clamp',
      });

      return (
        <TouchableOpacity
          style={[styles.swipeAction, styles.swipeComplete]}
          onPress={() => {
            swipeableRef.current?.close();
            onComplete();
          }}>
          <Animated.View
            style={[styles.swipeContent, {transform: [{scale}]}]}>
            <Icon name="check-circle" size={22} color="#fff" />
            <Text style={styles.swipeText}>Complete</Text>
          </Animated.View>
        </TouchableOpacity>
      );
    },
    [onComplete, order.status],
  );

  const handlePress = useCallback(() => {
    if (selectMode && onToggleSelect) {
      onToggleSelect();
    } else {
      onPress();
    }
  }, [selectMode, onToggleSelect, onPress]);

  const handleLongPress = useCallback(() => {
    if (onToggleSelect) {
      onToggleSelect();
    } else {
      copyToClipboard(order.number, `Order #${order.number}`);
    }
  }, [onToggleSelect, order.number]);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
      overshootRight={false}
      enabled={!selectMode}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}>
        <Card
          style={
            selected
              ? {borderColor: theme.primary, borderWidth: 2}
              : undefined
          }>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {selectMode && (
                <Icon
                  name={selected ? 'check-box' : 'check-box-outline-blank'}
                  size={22}
                  color={selected ? theme.primary : theme.textMuted}
                  style={styles.checkbox}
                />
              )}
              <Text style={[styles.orderNumber, {color: theme.textPrimary}]}>
                #{order.number}
              </Text>
            </View>
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
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
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
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    backgroundColor: '#3B82F6',
  },
  swipeComplete: {
    backgroundColor: '#22C55E',
  },
  swipeContent: {
    alignItems: 'center',
    gap: 4,
  },
  swipeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
