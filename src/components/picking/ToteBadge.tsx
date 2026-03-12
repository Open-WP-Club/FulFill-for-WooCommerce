import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ToteBadgeProps {
  toteBarcode: string | null;
  isVerified: boolean;
  onScanTote: () => void;
}

export function ToteBadge({toteBarcode, isVerified, onScanTote}: ToteBadgeProps) {
  if (!toteBarcode) {
    return (
      <TouchableOpacity style={styles.empty} onPress={onScanTote}>
        <Icon name="inbox" size={18} color="#6B7280" />
        <Text style={styles.emptyText}>Scan tote to assign</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.assigned} onPress={onScanTote}>
      <Icon name="inbox" size={18} color={isVerified ? '#10B981' : '#4F46E5'} />
      <Text style={styles.assignedText}>{toteBarcode}</Text>
      {isVerified && <Icon name="check-circle" size={16} color="#10B981" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
  },
  assigned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  assignedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
    flex: 1,
  },
});
