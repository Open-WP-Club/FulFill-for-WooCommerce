import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CameraView} from '../../components/scanner/CameraView';
import {ScanGuide} from '../../components/scanner/ScanGuide';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {useBarcodeScanner} from '../../hooks/useBarcodeScanner';
import {fetchProductBySku} from '../../api/products';
import {playSuccessFeedback, playErrorFeedback} from '../../utils/feedback';
import {StockIndicator} from '../../components/picking/StockIndicator';
import {useTheme} from '../../theme/ThemeContext';
import type {WcProduct} from '../../types/product';

export function ScannerScreen() {
  const theme = useTheme();
  const [scannedProduct, setScannedProduct] = useState<WcProduct | null>(null);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const handleScan = useCallback(async (barcode: string) => {
    setLastBarcode(barcode);
    setSearching(true);
    setScannedProduct(null);

    try {
      const product = await fetchProductBySku(barcode);
      setScannedProduct(product);
      if (product) {
        playSuccessFeedback();
      } else {
        playErrorFeedback();
      }
    } catch {
      setScannedProduct(null);
      playErrorFeedback();
    } finally {
      setSearching(false);
    }
  }, []);

  const {isActive, handleCodeScanned, resetScanner} = useBarcodeScanner({
    onScan: handleScan,
    cooldownMs: 2000,
  });

  return (
    <View style={[styles.container, {backgroundColor: theme.cameraBg}]}>
      <View style={styles.camera}>
        <CameraView isActive={isActive} onCodeScanned={handleCodeScanned} />
        <ScanGuide />
      </View>

      <View style={[styles.results, {backgroundColor: theme.background}]}>
        {lastBarcode && (
          <Card>
            <Text style={[styles.label, {color: theme.textMuted}]}>
              Scanned Barcode
            </Text>
            <Text style={[styles.barcode, {color: theme.textPrimary}]}>
              {lastBarcode}
            </Text>

            {searching && (
              <Text style={[styles.searching, {color: theme.textTertiary}]}>
                Searching product...
              </Text>
            )}

            {scannedProduct && (
              <View style={[styles.product, {borderTopColor: theme.border}]}>
                <Text style={[styles.productName, {color: theme.textPrimary}]}>
                  {scannedProduct.name}
                </Text>
                <Text style={[styles.productMeta, {color: theme.textTertiary}]}>
                  SKU: {scannedProduct.sku}
                </Text>
                <Text style={[styles.productMeta, {color: theme.textTertiary}]}>
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
});
