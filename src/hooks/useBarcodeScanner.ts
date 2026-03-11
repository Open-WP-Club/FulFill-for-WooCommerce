import {useState, useCallback, useRef} from 'react';
import type {Code} from 'react-native-vision-camera';

interface UseBarcodeSccannerOptions {
  onScan: (barcode: string) => void;
  cooldownMs?: number;
}

export function useBarcodeScanner({
  onScan,
  cooldownMs = 1500,
}: UseBarcodeSccannerOptions) {
  const [isActive, setIsActive] = useState(true);
  const lastScannedRef = useRef<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCodeScanned = useCallback(
    (codes: Code[]) => {
      if (!isActive || codes.length === 0) {
        return;
      }

      const code = codes[0];
      const value = code.value;

      if (!value || value === lastScannedRef.current) {
        return;
      }

      lastScannedRef.current = value;
      setIsActive(false);
      onScan(value);

      cooldownRef.current = setTimeout(() => {
        lastScannedRef.current = null;
        setIsActive(true);
      }, cooldownMs);
    },
    [isActive, onScan, cooldownMs],
  );

  const resetScanner = useCallback(() => {
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
    }
    lastScannedRef.current = null;
    setIsActive(true);
  }, []);

  return {
    isActive,
    handleCodeScanned,
    resetScanner,
    setIsActive,
  };
}
