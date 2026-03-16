import {Share} from 'react-native';
import type {ScanHistoryEntry} from '../stores/scanHistoryStore';

function entriesToCsv(entries: ScanHistoryEntry[]): string {
  const header = 'Barcode,Product Name,SKU,Found,Scanned At';
  const rows = entries.map(e => {
    const name = (e.productName ?? '').replace(/"/g, '""');
    const sku = (e.sku ?? '').replace(/"/g, '""');
    return `"${e.barcode}","${name}","${sku}",${e.found},"${e.scannedAt}"`;
  });
  return [header, ...rows].join('\n');
}

export async function exportScanHistory(
  entries: ScanHistoryEntry[],
): Promise<void> {
  const csv = entriesToCsv(entries);
  await Share.share({
    message: csv,
    title: 'Scan History Export',
  });
}
