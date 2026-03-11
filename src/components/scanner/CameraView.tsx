import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  type CodeType,
} from 'react-native-vision-camera';
import type {Code} from 'react-native-vision-camera';

interface CameraViewProps {
  isActive: boolean;
  onCodeScanned: (codes: Code[]) => void;
}

const CODE_TYPES: CodeType[] = [
  'ean-13',
  'ean-8',
  'upc-a',
  'upc-e',
  'code-128',
  'code-39',
  'code-93',
  'qr',
];

export function CameraView({isActive, onCodeScanned}: CameraViewProps) {
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: CODE_TYPES,
    onCodeScanned,
  });

  if (!device) {
    return (
      <View style={styles.noCamera}>
        <Text style={styles.noCameraText}>No camera device available</Text>
      </View>
    );
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      codeScanner={codeScanner}
    />
  );
}

const styles = StyleSheet.create({
  noCamera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  noCameraText: {
    color: '#fff',
    fontSize: 16,
  },
});
