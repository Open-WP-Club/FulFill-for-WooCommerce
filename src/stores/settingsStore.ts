import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../utils/storage';

interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoSyncEnabled: boolean;
  pollingIntervalMs: number;

  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  setPollingInterval: (ms: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      soundEnabled: true,
      hapticEnabled: true,
      autoSyncEnabled: true,
      pollingIntervalMs: 30000,

      setSoundEnabled: enabled => set({soundEnabled: enabled}),
      setHapticEnabled: enabled => set({hapticEnabled: enabled}),
      setAutoSyncEnabled: enabled => set({autoSyncEnabled: enabled}),
      setPollingInterval: ms => set({pollingIntervalMs: ms}),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
