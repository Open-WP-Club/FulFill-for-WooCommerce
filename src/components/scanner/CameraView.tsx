import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, Linking} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
  type CodeType,
} from 'react-native-vision-camera';
import type {Code} from 'react-native-vision-camera';
import {Button} from '../common/Button';

interface CameraViewProps {
  isActive: boolean;
  torch?: boolean;
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

export function CameraView({isActive, torch = false, onCodeScanned}: CameraViewProps) {
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().then(granted => {
        if (!granted) {
          setPermissionDenied(true);
        }
      });
    }
  }, [hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: CODE_TYPES,
    onCodeScanned,
  });

  if (permissionDenied) {
    return (
      <View style={styles.noCamera}>
        <Text style={styles.noCameraText}>Camera permission is required</Text>
        <Text style={styles.noCameraSubtext}>
          Please enable camera access in your device settings.
        </Text>
        <Button
          title="Open Settings"
          onPress={() => Linking.openSettings()}
          style={styles.settingsBtn}
        />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.noCamera}>
        <Text style={styles.noCameraText}>Requesting camera access...</Text>
      </View>
    );
  }

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
      torch={torch ? 'on' : 'off'}
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
    padding: 24,
  },
  noCameraText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  noCameraSubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  settingsBtn: {
    marginTop: 16,
  },
});
