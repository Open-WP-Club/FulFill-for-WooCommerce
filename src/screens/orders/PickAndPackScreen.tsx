import React, {useCallback, useEffect, useState} from 'react';
import {View, FlatList, StyleSheet, Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PickItemRow} from '../../components/picking/PickItemRow';
import {PickProgressBar} from '../../components/picking/PickProgressBar';
import {ScanResultOverlay} from '../../components/picking/ScanResultOverlay';
import {CameraView} from '../../components/scanner/CameraView';
import {ScanGuide} from '../../components/scanner/ScanGuide';
import {Button} from '../../components/common/Button';
import {usePickingStore} from '../../stores/pickingStore';
import {useOrderDetail} from '../../hooks/useOrderDetail';
import {useBarcodeScanner} from '../../hooks/useBarcodeScanner';
import {matchBarcodeToLineItem} from '../../utils/barcode';
import {vibrateSuccess, vibrateError} from '../../utils/notifications';
import {useSettingsStore} from '../../stores/settingsStore';
import type {OrdersStackParamList} from '../../types/navigation';
import type {PickItem} from '../../types/picking';

type Props = NativeStackScreenProps<OrdersStackParamList, 'PickAndPack'>;

export function PickAndPackScreen({route, navigation}: Props) {
  const {order} = route.params;
  const {changeStatus} = useOrderDetail(order.id);
  const {
    activeSession,
    startSession,
    endSession,
    incrementPicked,
    updateItemStatus,
    isSessionComplete,
  } = usePickingStore();
  const hapticEnabled = useSettingsStore(s => s.hapticEnabled);

  const [scanResult, setScanResult] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({visible: false, success: false, message: ''});

  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (!activeSession || activeSession.orderId !== order.id) {
      startSession(order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = useCallback(
    (barcode: string) => {
      if (!activeSession) {
        return;
      }

      const matched = matchBarcodeToLineItem(barcode, order.line_items);
      if (matched) {
        incrementPicked(matched.id);
        if (hapticEnabled) {
          vibrateSuccess();
        }
        setScanResult({
          visible: true,
          success: true,
          message: `Picked: ${matched.name}`,
        });
      } else {
        if (hapticEnabled) {
          vibrateError();
        }
        setScanResult({
          visible: true,
          success: false,
          message: `No match for barcode: ${barcode}`,
        });
      }
    },
    [activeSession, order.line_items, incrementPicked, hapticEnabled],
  );

  const {isActive, handleCodeScanned} = useBarcodeScanner({
    onScan: handleScan,
  });

  const handleComplete = useCallback(() => {
    if (!isSessionComplete()) {
      Alert.alert(
        'Incomplete',
        'Not all items have been picked. Complete anyway?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Complete',
            onPress: () => {
              changeStatus('completed');
              endSession();
              navigation.goBack();
            },
          },
        ],
      );
    } else {
      changeStatus('completed');
      endSession();
      navigation.goBack();
    }
  }, [isSessionComplete, changeStatus, endSession, navigation]);

  const renderItem = useCallback(
    ({item}: {item: PickItem}) => (
      <PickItemRow
        item={item}
        onMarkMissing={() => updateItemStatus(item.lineItemId, 'missing')}
        onMarkDamaged={() => updateItemStatus(item.lineItemId, 'damaged')}
      />
    ),
    [updateItemStatus],
  );

  if (!activeSession) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showScanner && (
        <View style={styles.scannerContainer}>
          <CameraView
            isActive={isActive && showScanner}
            onCodeScanned={handleCodeScanned}
          />
          <ScanGuide message="Scan item barcode" />
        </View>
      )}

      <ScanResultOverlay
        visible={scanResult.visible}
        success={scanResult.success}
        message={scanResult.message}
        onDismiss={() => setScanResult(s => ({...s, visible: false}))}
      />

      <PickProgressBar items={activeSession.items} />

      <FlatList
        data={activeSession.items}
        renderItem={renderItem}
        keyExtractor={item => item.lineItemId.toString()}
        style={styles.list}
      />

      <View style={styles.footer}>
        <Button
          title={showScanner ? 'Hide Scanner' : 'Scan Items'}
          variant="secondary"
          onPress={() => setShowScanner(!showScanner)}
          style={styles.footerBtn}
        />
        <Button
          title="Complete Order"
          onPress={handleComplete}
          style={styles.footerBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scannerContainer: {
    height: 200,
    position: 'relative',
  },
  list: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerBtn: {
    flex: 1,
  },
});
