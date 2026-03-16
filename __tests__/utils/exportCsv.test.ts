jest.mock('react-native', () => ({
  Share: {
    share: jest.fn().mockResolvedValue({action: 'sharedAction'}),
  },
}));

import {Share} from 'react-native';
import {exportScanHistory} from '../../src/utils/exportCsv';
import type {ScanHistoryEntry} from '../../src/stores/scanHistoryStore';

describe('exportScanHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates CSV and calls Share.share', async () => {
    const entries: ScanHistoryEntry[] = [
      {
        barcode: '4006381333931',
        productName: 'Test Product',
        sku: 'SKU-001',
        found: true,
        scannedAt: '2024-03-15T10:30:00.000Z',
      },
      {
        barcode: '1234567890123',
        productName: null,
        sku: null,
        found: false,
        scannedAt: '2024-03-15T10:31:00.000Z',
      },
    ];

    await exportScanHistory(entries);

    expect(Share.share).toHaveBeenCalledTimes(1);
    const call = (Share.share as jest.Mock).mock.calls[0][0];
    expect(call.message).toContain('Barcode,Product Name,SKU,Found,Scanned At');
    expect(call.message).toContain('"4006381333931","Test Product","SKU-001",true');
    expect(call.message).toContain('"1234567890123","","",false');
  });

  it('escapes double quotes in product names', async () => {
    const entries: ScanHistoryEntry[] = [
      {
        barcode: 'ABC',
        productName: 'Widget "Pro" Edition',
        sku: 'W-PRO',
        found: true,
        scannedAt: '2024-03-15T10:30:00.000Z',
      },
    ];

    await exportScanHistory(entries);

    const csv = (Share.share as jest.Mock).mock.calls[0][0].message;
    expect(csv).toContain('"Widget ""Pro"" Edition"');
  });

  it('handles empty entries', async () => {
    await exportScanHistory([]);

    const csv = (Share.share as jest.Mock).mock.calls[0][0].message;
    expect(csv).toBe('Barcode,Product Name,SKU,Found,Scanned At');
  });
});
