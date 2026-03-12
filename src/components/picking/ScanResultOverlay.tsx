import React, {useEffect} from 'react';
import {Text, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ScanResultOverlayProps {
  visible: boolean;
  success: boolean;
  message: string;
  onDismiss: () => void;
}

export function ScanResultOverlay({
  visible,
  success,
  message,
  onDismiss,
}: ScanResultOverlayProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }
  }, [visible, opacity, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {opacity},
        {backgroundColor: success ? '#10B981' : '#EF4444'},
      ]}>
      <Icon
        name={success ? 'check-circle' : 'error'}
        size={48}
        color="#fff"
      />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: '30%',
    left: 32,
    right: 32,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
});
