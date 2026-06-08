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

  it('starts in active state', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() => useBarcodeScanner({onScan}));
    expect(result.current.isActive).toBe(true);
  });

  it('calls onScan with barcode value', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() => useBarcodeScanner({onScan}));

    await act(async () => {
      result.current.handleCodeScanned([makeCode('4006381333931')]);
    });

    expect(onScan).toHaveBeenCalledWith('4006381333931');
  });

  it('deactivates after scan', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() => useBarcodeScanner({onScan}));

    await act(async () => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    expect(result.current.isActive).toBe(false);
  });

  it('reactivates after cooldown', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() =>
      useBarcodeScanner({onScan, cooldownMs: 1000}),
    );

    await act(async () => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });
    expect(result.current.isActive).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.isActive).toBe(true);
  });

  it('ignores duplicate scans within cooldown', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() =>
      useBarcodeScanner({onScan, cooldownMs: 2000}),
    );

    await act(async () => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    // Reset active to simulate re-activation without clearing lastScanned
    await act(async () => {
      result.current.setIsActive(true);
    });

    await act(async () => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it('ignores empty code arrays', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() => useBarcodeScanner({onScan}));

    await act(async () => {
      result.current.handleCodeScanned([]);
    });

    expect(onScan).not.toHaveBeenCalled();
    expect(result.current.isActive).toBe(true);
  });

  it('ignores codes with no value', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() => useBarcodeScanner({onScan}));

    await act(async () => {
      result.current.handleCodeScanned([{...makeCode(''), value: undefined} as unknown as Code]);
    });

    expect(onScan).not.toHaveBeenCalled();
  });

  it('takes the first code when multiple are scanned', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() => useBarcodeScanner({onScan}));

    await act(async () => {
      result.current.handleCodeScanned([makeCode('FIRST'), makeCode('SECOND')]);
    });

    expect(onScan).toHaveBeenCalledWith('FIRST');
    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it('does not fire when inactive', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() => useBarcodeScanner({onScan}));

    await act(async () => {
      result.current.setIsActive(false);
    });

    await act(async () => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    expect(onScan).not.toHaveBeenCalled();
  });

  it('resetScanner clears state and reactivates', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() =>
      useBarcodeScanner({onScan, cooldownMs: 5000}),
    );

    await act(async () => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });
    expect(result.current.isActive).toBe(false);

    await act(async () => {
      result.current.resetScanner();
    });
    expect(result.current.isActive).toBe(true);

    // Should be able to scan the same code again after reset
    await act(async () => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });
    expect(onScan).toHaveBeenCalledTimes(2);
  });

  it('uses default cooldown of 1500ms', async () => {
    const onScan = jest.fn();
    const {result} = await renderHook(() => useBarcodeScanner({onScan}));

    await act(async () => {
      result.current.handleCodeScanned([makeCode('ABC')]);
    });

    await act(async () => {
      jest.advanceTimersByTime(1499);
    });
    expect(result.current.isActive).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.isActive).toBe(true);
  });
});
