import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../utils/storage';

export interface ScanHistoryEntry {
  barcode: string;
  productName: string | null;
  sku: string | null;
  found: boolean;
  scannedAt: string;
}

const MAX_HISTORY = 50;

interface ScanHistoryState {
  entries: ScanHistoryEntry[];

  addEntry: (entry: Omit<ScanHistoryEntry, 'scannedAt'>) => void;
  clearHistory: () => void;
}

export const useScanHistoryStore = create<ScanHistoryState>()(
  persist(
    set => ({
      entries: [],

      addEntry: entry => {
        set(state => ({
          entries: [
            {...entry, scannedAt: new Date().toISOString()},
            ...state.entries,
          ].slice(0, MAX_HISTORY),
        }));
      },

      clearHistory: () => {
        set({entries: []});
      },
    }),
    {
      name: 'scan-history-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
