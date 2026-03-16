import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../utils/storage';
import type {ThemeMode} from '../theme/colors';

interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoSyncEnabled: boolean;
  pollingIntervalMs: number;
  notificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  lowStockThreshold: number;
  themeMode: ThemeMode;

  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setPollingInterval: (ms: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailySummaryEnabled: (enabled: boolean) => void;
  setLowStockThreshold: (n: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      soundEnabled: true,
      hapticEnabled: true,
      autoSyncEnabled: true,
      pollingIntervalMs: 30000,
      notificationsEnabled: true,
      dailySummaryEnabled: false,
      lowStockThreshold: 5,
      themeMode: 'system' as ThemeMode,

      setSoundEnabled: enabled => set({soundEnabled: enabled}),
      setHapticEnabled: enabled => set({hapticEnabled: enabled}),
      setAutoSyncEnabled: enabled => set({autoSyncEnabled: enabled}),
      setPollingInterval: ms => set({pollingIntervalMs: ms}),
      setNotificationsEnabled: enabled => set({notificationsEnabled: enabled}),
      setDailySummaryEnabled: enabled => set({dailySummaryEnabled: enabled}),
      setLowStockThreshold: n => set({lowStockThreshold: n}),
      setThemeMode: mode => set({themeMode: mode}),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
