import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';

export function OfflineBanner() {
  const {isConnected} = useNetworkStatus();

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>You are offline. Changes will sync when reconnected.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});
