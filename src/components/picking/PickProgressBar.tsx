import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {PickItem} from '../../types/picking';

interface PickProgressBarProps {
  items: PickItem[];
}

export function PickProgressBar({items}: PickProgressBarProps) {
  const total = items.length;
  const done = items.filter(
    i => i.status === 'picked' || i.status === 'missing' || i.status === 'damaged',
  ).length;
  const progress = total > 0 ? done / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.barBg}>
        <View style={[styles.barFill, {width: `${progress * 100}%`}]} />
      </View>
      <Text style={styles.text}>
        {done}/{total} items
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  barBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
