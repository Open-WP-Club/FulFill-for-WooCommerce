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

jest.mock('react-native-sound', () => {
  const MockSound = jest.fn(() => ({
    play: jest.fn(),
    stop: jest.fn((cb: () => void) => cb()),
    release: jest.fn(),
  }));
  (MockSound as any).setCategory = jest.fn();
  (MockSound as any).MAIN_BUNDLE = '';
  return MockSound;
});

jest.mock('react-native', () => ({
  Vibration: {
    vibrate: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('../../src/utils/notifications', () => ({
  vibrateSuccess: jest.fn(),
  vibrateError: jest.fn(),
}));

import {Vibration} from 'react-native';
import {playStatusFeedback} from '../../src/utils/feedback';
import {useSettingsStore} from '../../src/stores/settingsStore';

describe('playStatusFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.getState().setHapticEnabled(true);
    useSettingsStore.getState().setSoundEnabled(false);
  });

  it('vibrates with triple pulse for completed', () => {
    playStatusFeedback('completed');
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 80, 60, 80, 60, 80]);
  });

  it('vibrates with single long for processing', () => {
    playStatusFeedback('processing');
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 120]);
  });

  it('vibrates with double short for on-hold', () => {
    playStatusFeedback('on-hold');
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 60, 80, 60]);
  });

  it('vibrates with warning pattern for cancelled', () => {
    playStatusFeedback('cancelled');
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 200, 100, 200]);
  });

  it('vibrates with error pattern for failed', () => {
    playStatusFeedback('failed');
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 100, 50, 100, 50, 100]);
  });

  it('does not vibrate when haptic is disabled', () => {
    useSettingsStore.getState().setHapticEnabled(false);
    playStatusFeedback('completed');
    expect(Vibration.vibrate).not.toHaveBeenCalled();
  });
});
