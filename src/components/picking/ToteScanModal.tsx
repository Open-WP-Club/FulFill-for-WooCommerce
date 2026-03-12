import React from 'react';
import {View, Text, StyleSheet, Modal} from 'react-native';
import {CameraView} from '../scanner/CameraView';
import {ScanGuide} from '../scanner/ScanGuide';
import {Button} from '../common/Button';
import {useBarcodeScanner} from '../../hooks/useBarcodeScanner';
import {useTheme} from '../../theme/ThemeContext';

interface ToteScanModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
}

export function ToteScanModal({visible, onClose, onScanned}: ToteScanModalProps) {
  const theme = useTheme();
  const {isActive, handleCodeScanned} = useBarcodeScanner({
    onScan: onScanned,
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, {backgroundColor: theme.cameraBg}]}>
        <View style={[styles.header, {backgroundColor: theme.primary}]}>
          <Text style={[styles.title, {color: theme.textOnPrimary}]}>
            Scan Tote Barcode
          </Text>
        </View>
        <View style={styles.camera}>
          <CameraView isActive={isActive && visible} onCodeScanned={handleCodeScanned} />
          <ScanGuide message="Point at tote barcode" />
        </View>
        <View style={[styles.footer, {backgroundColor: theme.surface}]}>
          <Button title="Cancel" variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  footer: {
    padding: 16,
  },
});
