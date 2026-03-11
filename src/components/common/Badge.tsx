import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface BadgeProps {
  label: string;
  color: string;
  textColor?: string;
}

export function Badge({label, color, textColor = '#fff'}: BadgeProps) {
  return (
    <View style={[styles.badge, {backgroundColor: color}]}>
      <Text style={[styles.text, {color: textColor}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
