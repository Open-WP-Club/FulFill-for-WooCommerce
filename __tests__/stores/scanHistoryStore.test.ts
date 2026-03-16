jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    createMMKV: () => ({
      getString: (key: string) => store.get(key),
      set: (key: string, value: string | number | boolean) =>
        store.set(key, String(value)),
      remove: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
    }),
  };
});

import {useScanHistoryStore} from '../../src/stores/scanHistoryStore';

describe('scanHistoryStore', () => {
  beforeEach(() => {
    useScanHistoryStore.getState().clearHistory();
  });

  it('starts with empty entries', () => {
    expect(useScanHistoryStore.getState().entries).toEqual([]);
  });

  it('adds an entry with timestamp', () => {
    useScanHistoryStore.getState().addEntry({
      barcode: '4006381333931',
      productName: 'Test Product',
      sku: 'SKU-001',
      found: true,
    });

    const {entries} = useScanHistoryStore.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0].barcode).toBe('4006381333931');
    expect(entries[0].productName).toBe('Test Product');
    expect(entries[0].sku).toBe('SKU-001');
    expect(entries[0].found).toBe(true);
    expect(entries[0].scannedAt).toBeDefined();
  });

  it('prepends new entries (newest first)', () => {
    useScanHistoryStore.getState().addEntry({
      barcode: 'FIRST',
      productName: null,
      sku: null,
      found: false,
    });
    useScanHistoryStore.getState().addEntry({
      barcode: 'SECOND',
      productName: 'Product B',
      sku: 'B',
      found: true,
    });

    const {entries} = useScanHistoryStore.getState();
    expect(entries).toHaveLength(2);
    expect(entries[0].barcode).toBe('SECOND');
    expect(entries[1].barcode).toBe('FIRST');
  });

  it('limits history to 50 entries', () => {
    for (let i = 0; i < 55; i++) {
      useScanHistoryStore.getState().addEntry({
        barcode: `CODE-${i}`,
        productName: null,
        sku: null,
        found: false,
      });
    }

    const {entries} = useScanHistoryStore.getState();
    expect(entries).toHaveLength(50);
    expect(entries[0].barcode).toBe('CODE-54');
  });

  it('clearHistory removes all entries', () => {
    useScanHistoryStore.getState().addEntry({
      barcode: 'ABC',
      productName: null,
      sku: null,
      found: false,
    });

    useScanHistoryStore.getState().clearHistory();
    expect(useScanHistoryStore.getState().entries).toEqual([]);
  });
});
