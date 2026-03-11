import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CameraView} from '../../components/scanner/CameraView';
import {ScanGuide} from '../../components/scanner/ScanGuide';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {useBarcodeScanner} from '../../hooks/useBarcodeScanner';
import {fetchProductBySku} from '../../api/products';
import type {WcProduct} from '../../types/product';

export function ScannerScreen() {
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
    } catch {
      setScannedProduct(null);
    } finally {
      setSearching(false);
    }
  }, []);

  const {isActive, handleCodeScanned, resetScanner} = useBarcodeScanner({
    onScan: handleScan,
    cooldownMs: 2000,
  });

  return (
    <View style={styles.container}>
      <View style={styles.camera}>
        <CameraView isActive={isActive} onCodeScanned={handleCodeScanned} />
        <ScanGuide />
      </View>

      <View style={styles.results}>
        {lastBarcode && (
          <Card>
            <Text style={styles.label}>Scanned Barcode</Text>
            <Text style={styles.barcode}>{lastBarcode}</Text>

            {searching && (
              <Text style={styles.searching}>Searching product...</Text>
            )}

            {scannedProduct && (
              <View style={styles.product}>
                <Text style={styles.productName}>{scannedProduct.name}</Text>
                <Text style={styles.productSku}>
                  SKU: {scannedProduct.sku}
                </Text>
                <Text style={styles.productPrice}>
                  Price: {scannedProduct.price}
                </Text>
                <Text style={styles.productStock}>
                  Stock: {scannedProduct.stock_status} (
                  {scannedProduct.stock_quantity ?? 'N/A'})
                </Text>
              </View>
            )}

            {!searching && !scannedProduct && (
              <Text style={styles.notFound}>Product not found</Text>
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
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  results: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    minHeight: 200,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  barcode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
    marginBottom: 12,
  },
  searching: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  product: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  productSku: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  productStock: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  notFound: {
    fontSize: 14,
    color: '#EF4444',
  },
  scanBtn: {
    marginTop: 12,
  },
});
