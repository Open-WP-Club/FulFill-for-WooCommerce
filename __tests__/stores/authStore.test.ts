// Mock MMKV before importing stores
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

import {useAuthStore} from '../../src/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.siteUrl).toBe('');
    expect(state.consumerKey).toBe('');
    expect(state.consumerSecret).toBe('');
  });

  it('login sets credentials and isAuthenticated', () => {
    useAuthStore.getState().login('https://store.com', 'ck_test', 'cs_test');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.siteUrl).toBe('https://store.com');
    expect(state.consumerKey).toBe('ck_test');
    expect(state.consumerSecret).toBe('cs_test');
  });

  it('logout clears credentials', () => {
    useAuthStore.getState().login('https://store.com', 'ck_test', 'cs_test');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.siteUrl).toBe('');
    expect(state.consumerKey).toBe('');
    expect(state.consumerSecret).toBe('');
  });
});
