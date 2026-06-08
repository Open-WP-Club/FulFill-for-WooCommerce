jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MockSwipeable = React.forwardRef(
    ({children}: {children: React.ReactNode}, _ref: unknown) => React.createElement(View, null, children),
  );
  MockSwipeable.displayName = 'Swipeable';
  return {__esModule: true, default: MockSwipeable};
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

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

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({isConnected: true})),
}));

jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: jest.fn(() => ({id: 'back'})),
  useCameraPermission: jest.fn(() => ({hasPermission: true, requestPermission: jest.fn(() => Promise.resolve(true))})),
  useCodeScanner: jest.fn(() => ({})),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
  DefaultTheme: {dark: false, colors: {primary: '', background: '', card: '', text: '', border: '', notification: ''}},
  DarkTheme: {dark: true, colors: {primary: '', background: '', card: '', text: '', border: '', notification: ''}},
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));

jest.mock('react-native-sound', () => {
  class MockSound {
    static setCategory = jest.fn();
    play = jest.fn();
    stop = jest.fn(cb => cb && cb());
    release = jest.fn();
  }
  return MockSound;
});

jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    setString: jest.fn(),
    getString: jest.fn(() => Promise.resolve('')),
  },
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(() => Promise.resolve()),
    createChannel: jest.fn(() => Promise.resolve()),
    displayNotification: jest.fn(() => Promise.resolve()),
    createTriggerNotification: jest.fn(() => Promise.resolve()),
    getTriggerNotificationIds: jest.fn(() => Promise.resolve([])),
    cancelTriggerNotification: jest.fn(() => Promise.resolve()),
  },
  AndroidImportance: {HIGH: 4, DEFAULT: 3},
  TriggerType: {TIMESTAMP: 0},
  RepeatFrequency: {DAILY: 3},
}));

jest.mock('react-native-shake', () => ({
  __esModule: true,
  default: {
    addListener: jest.fn(() => ({remove: jest.fn()})),
  },
}));

jest.mock('react-native-volume-manager', () => ({
  VolumeManager: {
    addVolumeListener: jest.fn(() => ({remove: jest.fn()})),
  },
}));

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders without crashing', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
