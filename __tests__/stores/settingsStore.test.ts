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

import {useSettingsStore} from '../../src/stores/settingsStore';

describe('settingsStore', () => {
  it('has correct defaults', () => {
    const state = useSettingsStore.getState();
    expect(state.soundEnabled).toBe(true);
    expect(state.hapticEnabled).toBe(true);
    expect(state.autoSyncEnabled).toBe(true);
    expect(state.pollingIntervalMs).toBe(30000);
    expect(state.notificationsEnabled).toBe(true);
    expect(state.lowStockThreshold).toBe(5);
  });

  it('toggles sound', () => {
    useSettingsStore.getState().setSoundEnabled(false);
    expect(useSettingsStore.getState().soundEnabled).toBe(false);
    useSettingsStore.getState().setSoundEnabled(true);
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
  });

  it('toggles haptic', () => {
    useSettingsStore.getState().setHapticEnabled(false);
    expect(useSettingsStore.getState().hapticEnabled).toBe(false);
  });

  it('toggles auto sync', () => {
    useSettingsStore.getState().setAutoSyncEnabled(false);
    expect(useSettingsStore.getState().autoSyncEnabled).toBe(false);
  });

  it('sets polling interval', () => {
    useSettingsStore.getState().setPollingInterval(60000);
    expect(useSettingsStore.getState().pollingIntervalMs).toBe(60000);
  });

  it('toggles notifications', () => {
    useSettingsStore.getState().setNotificationsEnabled(false);
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
    useSettingsStore.getState().setNotificationsEnabled(true);
    expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
  });

  it('sets low stock threshold', () => {
    useSettingsStore.getState().setLowStockThreshold(10);
    expect(useSettingsStore.getState().lowStockThreshold).toBe(10);
  });

  it('has daily summary disabled by default', () => {
    expect(useSettingsStore.getState().dailySummaryEnabled).toBe(false);
  });

  it('toggles daily summary', () => {
    useSettingsStore.getState().setDailySummaryEnabled(true);
    expect(useSettingsStore.getState().dailySummaryEnabled).toBe(true);
    useSettingsStore.getState().setDailySummaryEnabled(false);
    expect(useSettingsStore.getState().dailySummaryEnabled).toBe(false);
  });
});
