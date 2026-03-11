import React from 'react';
import {ScrollView, TouchableOpacity, Text, StyleSheet} from 'react-native';
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}>
      {FILTERS.map(filter => (
        <TouchableOpacity
          key={filter.value}
          style={[
            styles.chip,
            activeFilter === filter.value && styles.chipActive,
          ]}
          onPress={() => onFilterChange(filter.value)}>
          <Text
            style={[
              styles.chipText,
              activeFilter === filter.value && styles.chipTextActive,
            ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
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
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#4F46E5',
  },
  chipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
});
