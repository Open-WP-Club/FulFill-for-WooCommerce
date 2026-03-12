import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../../theme/ThemeContext';

interface EmptyStateProps {
  icon: string;
  title: string;
  message?: string;
}

export function EmptyState({icon, title, message}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={theme.inputBorder} />
      <Text style={[styles.title, {color: theme.textTertiary}]}>{title}</Text>
      {message && (
        <Text style={[styles.message, {color: theme.textMuted}]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  message: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
