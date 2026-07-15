import React, {useCallback, useRef} from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Icon from '@react-native-vector-icons/material-icons';
import {Card} from '../common/Card';
import {StatusBadge} from './StatusBadge';
import {formatCurrency, formatDate, formatCustomerName} from '../../utils/formatters';
import {useTheme} from '../../theme/ThemeContext';
import {copyToClipboard} from '../../utils/clipboard';
import {PriorityIndicator} from './PriorityIndicator';
import {computeOrderPriority} from '../../utils/priority';
import type {WcOrder} from '../../types/order';

interface OrderCardProps {
  order: WcOrder;
  onPress: () => void;
  onComplete?: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  selectMode?: boolean;
}

function RightAction({
  dragX,
  onPress,
}: {
  dragX: SharedValue<number>;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: interpolate(dragX.value, [-80, 0], [1, 0.5], 'clamp')},
    ],
  }));
  return (
    <TouchableOpacity style={styles.swipeAction} onPress={onPress}>
      <Animated.View style={[styles.swipeContent, animatedStyle]}>
        <Icon name="visibility" size={22} color="#fff" />
        <Text style={styles.swipeText}>View</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function LeftAction({
  dragX,
  onPress,
}: {
  dragX: SharedValue<number>;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: interpolate(dragX.value, [0, 80], [0.5, 1], 'clamp')},
    ],
  }));
  return (
    <TouchableOpacity
      style={[styles.swipeAction, styles.swipeComplete]}
      onPress={onPress}>
      <Animated.View style={[styles.swipeContent, animatedStyle]}>
        <Icon name="check-circle" size={22} color="#fff" />
        <Text style={styles.swipeText}>Complete</Text>
      </Animated.View>
    </TouchableOpacity>
  );
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
  const swipeableRef = useRef<SwipeableMethods>(null);

  const renderRightActions = useCallback(
    (_progress: SharedValue<number>, dragX: SharedValue<number>) => (
      <RightAction
        dragX={dragX}
        onPress={() => {
          swipeableRef.current?.close();
          onPress();
        }}
      />
    ),
    [onPress],
  );

  const renderLeftActions = useCallback(
    (_progress: SharedValue<number>, dragX: SharedValue<number>) => {
      if (!onComplete || order.status === 'completed') {
        return null;
      }
      return (
        <LeftAction
          dragX={dragX}
          onPress={() => {
            swipeableRef.current?.close();
            onComplete();
          }}
        />
      );
    },
    [onComplete, order.status],
  );

  const priority = computeOrderPriority(order);

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
              <PriorityIndicator level={priority.level} />
            </View>
            <StatusBadge status={order.status} />
          </View>
          <View style={styles.row}>
            <Text style={[styles.customer, {color: theme.textSecondary}]}>
              {formatCustomerName(order.billing)}
            </Text>
            <Text style={[styles.meta, {color: theme.textMuted}]}>
              {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.date, {color: theme.textMuted}]}>
              {formatDate(order.date_created)}
            </Text>
            <Text style={[styles.total, {color: theme.textPrimary}]}>
              {formatCurrency(order.total, order.currency)}
            </Text>
          </View>
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
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  orderNumber: {
    fontSize: 17,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  customer: {
    fontSize: 14,
  },
  meta: {
    fontSize: 13,
  },
  date: {
    fontSize: 12,
  },
  total: {
    fontSize: 15,
    fontWeight: '600',
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
