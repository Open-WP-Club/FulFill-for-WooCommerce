import React from 'react';
import {View, Text, StyleSheet, Modal} from 'react-native';
import {CameraView} from '../scanner/CameraView';
import {ScanGuide} from '../scanner/ScanGuide';
import {Button} from '../common/Button';
import {useBarcodeScanner} from '../../hooks/useBarcodeScanner';

interface ToteScanModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
}

export function ToteScanModal({visible, onClose, onScanned}: ToteScanModalProps) {
  const {isActive, handleCodeScanned} = useBarcodeScanner({
    onScan: onScanned,
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan Tote Barcode</Text>
        </View>
        <View style={styles.camera}>
          <CameraView isActive={isActive && visible} onCodeScanned={handleCodeScanned} />
          <ScanGuide message="Point at tote barcode" />
        </View>
        <View style={styles.footer}>
          <Button title="Cancel" variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    backgroundColor: '#4F46E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
  },
});
