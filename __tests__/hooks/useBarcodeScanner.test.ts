import {renderHook, act} from '@testing-library/react-native';
import {useBarcodeScanner} from '../../src/hooks/useBarcodeScanner';
import type {Code} from 'react-native-vision-camera';

const makeCode = (value: string): Code =>
  ({value, type: 'ean-13', frame: {x: 0, y: 0, width: 100, height: 50}} as Code);

describe('useBarcodeScanner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in active state', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() => useBarcodeScanner({onScan}));
    expect(result.current.isActive).toBe(true);
  });

  it('calls onScan with barcode value', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() => useBarcodeScanner({onScan}));

    act(() => {
      result.current.handleCodeScanned([makeCode('4006381333931')]);
    });

    expect(onScan).toHaveBeenCalledWith('4006381333931');
  });

  it('deactivates after scan', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() => useBarcodeScanner({onScan}));

    act(() => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    expect(result.current.isActive).toBe(false);
  });

  it('reactivates after cooldown', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() =>
      useBarcodeScanner({onScan, cooldownMs: 1000}),
    );

    act(() => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });
    expect(result.current.isActive).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.isActive).toBe(true);
  });

  it('ignores duplicate scans within cooldown', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() =>
      useBarcodeScanner({onScan, cooldownMs: 2000}),
    );

    act(() => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    // Reset active to simulate re-activation without clearing lastScanned
    act(() => {
      result.current.setIsActive(true);
    });

    act(() => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it('ignores empty code arrays', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() => useBarcodeScanner({onScan}));

    act(() => {
      result.current.handleCodeScanned([]);
    });

    expect(onScan).not.toHaveBeenCalled();
    expect(result.current.isActive).toBe(true);
  });

  it('ignores codes with no value', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() => useBarcodeScanner({onScan}));

    act(() => {
      result.current.handleCodeScanned([{...makeCode(''), value: undefined} as unknown as Code]);
    });

    expect(onScan).not.toHaveBeenCalled();
  });

  it('takes the first code when multiple are scanned', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() => useBarcodeScanner({onScan}));

    act(() => {
      result.current.handleCodeScanned([makeCode('FIRST'), makeCode('SECOND')]);
    });

    expect(onScan).toHaveBeenCalledWith('FIRST');
    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it('does not fire when inactive', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() => useBarcodeScanner({onScan}));

    act(() => {
      result.current.setIsActive(false);
    });

    act(() => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    expect(onScan).not.toHaveBeenCalled();
  });

  it('resetScanner clears state and reactivates', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() =>
      useBarcodeScanner({onScan, cooldownMs: 5000}),
    );

    act(() => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });
    expect(result.current.isActive).toBe(false);

    act(() => {
      result.current.resetScanner();
    });
    expect(result.current.isActive).toBe(true);

    // Should be able to scan the same code again after reset
    act(() => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });
    expect(onScan).toHaveBeenCalledTimes(2);
  });

  it('uses default cooldown of 1500ms', () => {
    const onScan = jest.fn();
    const {result} = renderHook(() => useBarcodeScanner({onScan}));

    act(() => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    act(() => {
      jest.advanceTimersByTime(1499);
    });
    expect(result.current.isActive).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.isActive).toBe(true);
  });
});
