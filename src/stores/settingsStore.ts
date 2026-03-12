import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../utils/storage';

interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoSyncEnabled: boolean;
  pollingIntervalMs: number;
  notificationsEnabled: boolean;
  lowStockThreshold: number;

  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setPollingInterval: (ms: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setLowStockThreshold: (n: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      soundEnabled: true,
      hapticEnabled: true,
      autoSyncEnabled: true,
      pollingIntervalMs: 30000,
      notificationsEnabled: true,
      lowStockThreshold: 5,

      setSoundEnabled: enabled => set({soundEnabled: enabled}),
      setHapticEnabled: enabled => set({hapticEnabled: enabled}),
      setAutoSyncEnabled: enabled => set({autoSyncEnabled: enabled}),
      setPollingInterval: ms => set({pollingIntervalMs: ms}),
      setNotificationsEnabled: enabled => set({notificationsEnabled: enabled}),
      setLowStockThreshold: n => set({lowStockThreshold: n}),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
