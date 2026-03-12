import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../../theme/ThemeContext';

interface ToteBadgeProps {
  toteBarcode: string | null;
  isVerified: boolean;
  onScanTote: () => void;
}

export function ToteBadge({toteBarcode, isVerified, onScanTote}: ToteBadgeProps) {
  const theme = useTheme();

  if (!toteBarcode) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          {backgroundColor: theme.surfaceSecondary, borderBottomColor: theme.border},
        ]}
        onPress={onScanTote}>
        <Icon name="inbox" size={18} color={theme.textTertiary} />
        <Text style={[styles.text, {color: theme.textTertiary}]}>
          Scan tote to assign
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {backgroundColor: theme.primaryLight, borderBottomColor: theme.border},
      ]}
      onPress={onScanTote}>
      <Icon
        name="inbox"
        size={18}
        color={isVerified ? theme.success : theme.primary}
      />
      <Text style={[styles.assignedText, {color: theme.primary}]}>
        {toteBarcode}
      </Text>
      {isVerified && <Icon name="check-circle" size={16} color={theme.success} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 13,
  },
  assignedText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
