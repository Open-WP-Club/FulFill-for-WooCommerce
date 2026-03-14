import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {matchBarcodeToLineItem, isToteBarcode} from '../../utils/barcode';
import {playSuccessFeedback, playErrorFeedback} from '../../utils/feedback';
import {useToteStore} from '../../stores/toteStore';
import {useAnalyticsStore} from '../../stores/analyticsStore';
import {ToteBadge} from '../../components/picking/ToteBadge';
import {ToteScanModal} from '../../components/picking/ToteScanModal';
import {useTheme} from '../../theme/ThemeContext';
import type {OrdersStackParamList} from '../../types/navigation';
import type {PickItem} from '../../types/picking';

type Props = NativeStackScreenProps<OrdersStackParamList, 'PickAndPack'>;

export function PickAndPackScreen({route, navigation}: Props) {
  const theme = useTheme();
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

  const toteAssignment = useToteStore(s => s.assignments[order.id]);
  const assignTote = useToteStore(s => s.assignTote);
  const clearAssignment = useToteStore(s => s.clearAssignment);
  const recordSession = useAnalyticsStore(s => s.recordSession);

  const [toteScanVisible, setToteScanVisible] = useState(false);
  const [scanResult, setScanResult] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({visible: false, success: false, message: ''});

  const [showScanner, setShowScanner] = useState(false);
  const autoCompleteShown = useRef(false);

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

      if (isToteBarcode(barcode)) {
        assignTote(order.id, order.number, barcode);
        playSuccessFeedback();
        setScanResult({
          visible: true,
          success: true,
          message: `Tote assigned: ${barcode}`,
        });
        return;
      }

      const matched = matchBarcodeToLineItem(barcode, order.line_items);
      if (matched) {
        incrementPicked(matched.id);
        playSuccessFeedback();
        setScanResult({
          visible: true,
          success: true,
          message: `Picked: ${matched.name}`,
        });
      } else {
        playErrorFeedback();
        setScanResult({
          visible: true,
          success: false,
          message: `No match for barcode: ${barcode}`,
        });
      }
    },
    [activeSession, order.line_items, order.id, order.number, incrementPicked, assignTote],
  );

  const {isActive, handleCodeScanned} = useBarcodeScanner({
    onScan: handleScan,
  });

  const finishOrder = useCallback(() => {
    if (activeSession) {
      const now = new Date().toISOString();
      const startMs = new Date(activeSession.startedAt).getTime();
      const durationMs = Date.now() - startMs;
      recordSession({
        sessionId: `${order.id}-${startMs}`,
        orderId: order.id,
        orderNumber: order.number,
        startedAt: activeSession.startedAt,
        completedAt: now,
        totalItems: activeSession.items.reduce((sum, i) => sum + i.quantity, 0),
        pickedCorrectly: activeSession.items
          .filter(i => i.status === 'picked')
          .reduce((sum, i) => sum + i.pickedQuantity, 0),
        markedMissing: activeSession.items.filter(i => i.status === 'missing').length,
        markedDamaged: activeSession.items.filter(i => i.status === 'damaged').length,
        durationMs,
      });
    }
    changeStatus('completed');
    endSession();
    clearAssignment(order.id);
    navigation.goBack();
  }, [activeSession, order, changeStatus, endSession, clearAssignment, recordSession, navigation]);

  const handleComplete = useCallback(() => {
    if (!isSessionComplete()) {
      Alert.alert(
        'Incomplete',
        'Not all items have been picked. Complete anyway?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Complete', onPress: finishOrder},
        ],
      );
    } else {
      finishOrder();
    }
  }, [isSessionComplete, finishOrder]);

  // Auto-complete prompt when all items are picked
  useEffect(() => {
    if (activeSession && isSessionComplete() && !autoCompleteShown.current) {
      autoCompleteShown.current = true;
      Alert.alert(
        'All Items Picked!',
        'All items have been scanned. Complete this order?',
        [
          {text: 'Not Yet', style: 'cancel'},
          {text: 'Complete', onPress: finishOrder},
        ],
      );
    }
  }, [activeSession, isSessionComplete, finishOrder]);

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
    <View style={[styles.container, {backgroundColor: theme.background}]}>
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

      <ToteBadge
        toteBarcode={toteAssignment?.toteBarcode ?? null}
        isVerified={!!toteAssignment?.verifiedAt}
        onScanTote={() => setToteScanVisible(true)}
      />

      <ToteScanModal
        visible={toteScanVisible}
        onClose={() => setToteScanVisible(false)}
        onScanned={barcode => {
          assignTote(order.id, order.number, barcode);
          setToteScanVisible(false);
        }}
      />

      <FlatList
        data={activeSession.items}
        renderItem={renderItem}
        keyExtractor={item => item.lineItemId.toString()}
        style={styles.list}
      />

      <View
        style={[
          styles.footer,
          {backgroundColor: theme.surface, borderTopColor: theme.border},
        ]}>
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
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
  },
});
