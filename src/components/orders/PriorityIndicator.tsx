import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon, {type MaterialIconsIconName} from '@react-native-vector-icons/material-icons';
import type {PriorityLevel} from '../../utils/priority';
import {PRIORITY_COLORS} from '../../utils/priority';

interface PriorityIndicatorProps {
  level: PriorityLevel;
  reasons?: string[];
  compact?: boolean;
}

const ICONS: Record<PriorityLevel, MaterialIconsIconName> = {
  urgent: 'priority-high',
  high: 'arrow-upward',
  normal: 'remove',
  low: 'arrow-downward',
};

export function PriorityIndicator({
  level,
  reasons,
  compact = true,
}: PriorityIndicatorProps) {
  if (level === 'low' || level === 'normal') {
    return null;
  }

  const color = PRIORITY_COLORS[level];

  return (
    <View style={styles.container}>
      <Icon name={ICONS[level]} size={compact ? 14 : 16} color={color} />
      {!compact && reasons && reasons.length > 0 && (
        <Text style={[styles.text, {color}]} numberOfLines={1}>
          {reasons.join(' · ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
