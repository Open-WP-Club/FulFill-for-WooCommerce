import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {CameraView} from '../../components/scanner/CameraView';
import {ScanGuide} from '../../components/scanner/ScanGuide';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {useBarcodeScanner} from '../../hooks/useBarcodeScanner';
import {fetchProductBySku} from '../../api/products';
import {playSuccessFeedback, playErrorFeedback} from '../../utils/feedback';
import {copyToClipboard} from '../../utils/clipboard';
import {StockIndicator} from '../../components/picking/StockIndicator';
import {useTheme} from '../../theme/ThemeContext';
import {
  useScanHistoryStore,
  type ScanHistoryEntry,
} from '../../stores/scanHistoryStore';
import type {WcProduct} from '../../types/product';
import {format} from 'date-fns';

export function ScannerScreen() {
  const theme = useTheme();
  const [scannedProduct, setScannedProduct] = useState<WcProduct | null>(null);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const {entries, addEntry, clearHistory} = useScanHistoryStore();

  const handleScan = useCallback(
    async (barcode: string) => {
      setLastBarcode(barcode);
      setSearching(true);
      setScannedProduct(null);
      setShowHistory(false);

      try {
        const product = await fetchProductBySku(barcode);
        setScannedProduct(product);
        addEntry({
          barcode,
          productName: product?.name ?? null,
          sku: product?.sku ?? null,
          found: !!product,
        });
        if (product) {
          playSuccessFeedback();
        } else {
          playErrorFeedback();
        }
      } catch {
        setScannedProduct(null);
        addEntry({barcode, productName: null, sku: null, found: false});
        playErrorFeedback();
      } finally {
        setSearching(false);
      }
    },
    [addEntry],
  );

  const {isActive, handleCodeScanned, resetScanner} = useBarcodeScanner({
    onScan: handleScan,
    cooldownMs: 2000,
  });

  const renderHistoryItem = useCallback(
    ({item}: {item: ScanHistoryEntry}) => (
      <Pressable
        onLongPress={() => copyToClipboard(item.barcode, 'Barcode')}
        style={[styles.historyItem, {borderBottomColor: theme.border}]}>
        <View style={styles.historyLeft}>
          <Icon
            name={item.found ? 'check-circle' : 'error-outline'}
            size={18}
            color={item.found ? theme.success : theme.error}
          />
          <View style={styles.historyText}>
            <Text
              style={[styles.historyBarcode, {color: theme.textPrimary}]}
              numberOfLines={1}>
              {item.barcode}
            </Text>
            <Text
              style={[styles.historyMeta, {color: theme.textTertiary}]}
              numberOfLines={1}>
              {item.productName ?? 'Not found'}
              {' \u00B7 '}
              {format(new Date(item.scannedAt), 'HH:mm')}
            </Text>
          </View>
        </View>
      </Pressable>
    ),
    [theme],
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.cameraBg}]}>
      <View style={styles.camera}>
        <CameraView
          isActive={isActive}
          torch={torchOn}
          onCodeScanned={handleCodeScanned}
        />
        <ScanGuide />

        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={[styles.controlBtn, torchOn && styles.controlBtnActive]}
            onPress={() => setTorchOn(prev => !prev)}>
            <Icon
              name={torchOn ? 'flash-on' : 'flash-off'}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              showHistory && styles.controlBtnActive,
            ]}
            onPress={() => setShowHistory(prev => !prev)}>
            <Icon name="history" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.results, {backgroundColor: theme.background}]}>
        {showHistory ? (
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, {color: theme.textPrimary}]}>
                Scan History
              </Text>
              {entries.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={[styles.clearBtn, {color: theme.error}]}>
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {entries.length === 0 ? (
              <Text style={[styles.emptyHistory, {color: theme.textTertiary}]}>
                No scans yet
              </Text>
            ) : (
              <FlatList
                data={entries}
                renderItem={renderHistoryItem}
                keyExtractor={(item, index) => `${item.scannedAt}-${index}`}
              />
            )}
          </View>
        ) : (
          <>
            {lastBarcode && (
              <Card>
                <Text style={[styles.label, {color: theme.textMuted}]}>
                  Scanned Barcode
                </Text>
                <Pressable
                  onLongPress={() =>
                    copyToClipboard(lastBarcode, 'Barcode')
                  }>
                  <Text style={[styles.barcode, {color: theme.textPrimary}]}>
                    {lastBarcode}
                  </Text>
                </Pressable>

                {searching && (
                  <Text
                    style={[styles.searching, {color: theme.textTertiary}]}>
                    Searching product...
                  </Text>
                )}

                {scannedProduct && (
                  <View
                    style={[
                      styles.product,
                      {borderTopColor: theme.border},
                    ]}>
                    <Text
                      style={[
                        styles.productName,
                        {color: theme.textPrimary},
                      ]}>
                      {scannedProduct.name}
                    </Text>
                    <Pressable
                      onLongPress={() =>
                        copyToClipboard(scannedProduct.sku, 'SKU')
                      }>
                      <Text
                        style={[
                          styles.productMeta,
                          {color: theme.textTertiary},
                        ]}>
                        SKU: {scannedProduct.sku}
                      </Text>
                    </Pressable>
                    <Text
                      style={[
                        styles.productMeta,
                        {color: theme.textTertiary},
                      ]}>
                      Price: {scannedProduct.price}
                    </Text>
                    <StockIndicator
                      stockQuantity={scannedProduct.stock_quantity}
                      stockStatus={scannedProduct.stock_status}
                    />
                  </View>
                )}

                {!searching && !scannedProduct && (
                  <Text style={[styles.notFound, {color: theme.error}]}>
                    Product not found
                  </Text>
                )}
              </Card>
            )}

            <Button
              title="Scan Again"
              onPress={resetScanner}
              style={styles.scanBtn}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  cameraControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 10,
  },
  controlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(249,115,22,0.8)',
  },
  results: {
    padding: 16,
    minHeight: 200,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  barcode: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  searching: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  product: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productMeta: {
    fontSize: 14,
    marginTop: 2,
  },
  notFound: {
    fontSize: 14,
  },
  scanBtn: {
    marginTop: 12,
  },
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  clearBtn: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHistory: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  historyText: {
    flex: 1,
  },
  historyBarcode: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
