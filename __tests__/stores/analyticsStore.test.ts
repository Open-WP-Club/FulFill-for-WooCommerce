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

import {useAnalyticsStore} from '../../src/stores/analyticsStore';
import type {PickSessionRecord} from '../../src/types/analytics';

const makeSession = (overrides: Partial<PickSessionRecord> = {}): PickSessionRecord => ({
  sessionId: 'session-1',
  orderId: 100,
  orderNumber: '1001',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  totalItems: 10,
  pickedCorrectly: 8,
  markedMissing: 1,
  markedDamaged: 1,
  durationMs: 60000,
  ...overrides,
});

describe('analyticsStore', () => {
  beforeEach(() => {
    useAnalyticsStore.setState({sessions: [], pickerName: ''});
  });

  describe('recordSession', () => {
    it('adds a session to the list', () => {
      useAnalyticsStore.getState().recordSession(makeSession());

      expect(useAnalyticsStore.getState().sessions).toHaveLength(1);
      expect(useAnalyticsStore.getState().sessions[0].orderId).toBe(100);
    });

    it('prepends new sessions (newest first)', () => {
      useAnalyticsStore.getState().recordSession(makeSession({sessionId: 'a', orderId: 1}));
      useAnalyticsStore.getState().recordSession(makeSession({sessionId: 'b', orderId: 2}));

      expect(useAnalyticsStore.getState().sessions[0].orderId).toBe(2);
      expect(useAnalyticsStore.getState().sessions[1].orderId).toBe(1);
    });

    it('caps at 500 sessions', () => {
      for (let i = 0; i < 510; i++) {
        useAnalyticsStore.getState().recordSession(
          makeSession({sessionId: `s-${i}`}),
        );
      }

      expect(useAnalyticsStore.getState().sessions).toHaveLength(500);
    });
  });

  describe('setPickerName', () => {
    it('sets the picker name', () => {
      useAnalyticsStore.getState().setPickerName('John');
      expect(useAnalyticsStore.getState().pickerName).toBe('John');
    });
  });

  describe('clearSessions', () => {
    it('removes all sessions', () => {
      useAnalyticsStore.getState().recordSession(makeSession());
      useAnalyticsStore.getState().recordSession(makeSession({sessionId: 'b'}));

      useAnalyticsStore.getState().clearSessions();

      expect(useAnalyticsStore.getState().sessions).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('returns zeroes when no sessions', () => {
      const stats = useAnalyticsStore.getState().getStats();

      expect(stats.totalSessions).toBe(0);
      expect(stats.totalItemsPicked).toBe(0);
      expect(stats.avgTimePerItemMs).toBe(0);
      expect(stats.accuracyRate).toBe(0);
      expect(stats.sessionsToday).toBe(0);
    });

    it('calculates stats correctly', () => {
      useAnalyticsStore.getState().recordSession(
        makeSession({
          totalItems: 10,
          pickedCorrectly: 9,
          durationMs: 60000,
          completedAt: new Date().toISOString(),
        }),
      );
      useAnalyticsStore.getState().recordSession(
        makeSession({
          sessionId: 's2',
          totalItems: 20,
          pickedCorrectly: 18,
          durationMs: 120000,
          completedAt: new Date().toISOString(),
        }),
      );

      const stats = useAnalyticsStore.getState().getStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalItemsPicked).toBe(27); // 9 + 18
      expect(stats.avgTimePerItemMs).toBe(6000); // 180000 / 30
      expect(stats.accuracyRate).toBe(0.9); // 27 / 30
      expect(stats.sessionsToday).toBe(2);
    });

    it('counts only today sessions for sessionsToday', () => {
      useAnalyticsStore.getState().recordSession(
        makeSession({
          completedAt: new Date().toISOString(),
        }),
      );
      useAnalyticsStore.getState().recordSession(
        makeSession({
          sessionId: 'old',
          completedAt: '2024-01-01T00:00:00.000Z',
        }),
      );

      const stats = useAnalyticsStore.getState().getStats();
      expect(stats.sessionsToday).toBe(1);
      expect(stats.totalSessions).toBe(2);
    });
  });
});
