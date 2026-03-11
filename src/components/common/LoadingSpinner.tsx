import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

export function LoadingSpinner({size = 'large'}: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#4F46E5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
