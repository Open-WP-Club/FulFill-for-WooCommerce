import React from 'react';
import {View, StyleSheet, type ViewStyle} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({children, style}: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {backgroundColor: theme.surface, shadowColor: theme.shadow},
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
