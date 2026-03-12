import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import type {PickItem} from '../../types/picking';

interface PickProgressBarProps {
  items: PickItem[];
}

export function PickProgressBar({items}: PickProgressBarProps) {
  const theme = useTheme();
  const total = items.length;
  const done = items.filter(
    i => i.status === 'picked' || i.status === 'missing' || i.status === 'damaged',
  ).length;
  const progress = total > 0 ? done / total : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.barBg, {backgroundColor: theme.border}]}>
        <View
          style={[styles.barFill, {width: `${progress * 100}%`, backgroundColor: theme.success}]}
        />
      </View>
      <Text style={[styles.text, {color: theme.textTertiary}]}>
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
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
