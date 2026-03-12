import React from 'react';
import {ScrollView, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import type {WcOrderStatus} from '../../types/order';

const FILTERS: Array<{label: string; value: WcOrderStatus | 'all'}> = [
  {label: 'All', value: 'all'},
  {label: 'Processing', value: 'processing'},
  {label: 'On Hold', value: 'on-hold'},
  {label: 'Pending', value: 'pending'},
  {label: 'Completed', value: 'completed'},
];

interface FilterBarProps {
  activeFilter: WcOrderStatus | 'all';
  onFilterChange: (filter: WcOrderStatus | 'all') => void;
}

export function FilterBar({activeFilter, onFilterChange}: FilterBarProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}>
      {FILTERS.map(filter => {
        const isActive = activeFilter === filter.value;
        return (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.chip,
              {backgroundColor: isActive ? theme.primary : theme.surfaceSecondary},
            ]}
            onPress={() => onFilterChange(filter.value)}>
            <Text
              style={[
                styles.chipText,
                {color: isActive ? theme.textOnPrimary : theme.textTertiary},
              ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 48,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
