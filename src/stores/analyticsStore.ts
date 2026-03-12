import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../utils/storage';
import type {PickSessionRecord, PickerStats} from '../types/analytics';

interface AnalyticsStoreState {
  sessions: PickSessionRecord[];
  pickerName: string;

  recordSession: (record: PickSessionRecord) => void;
  setPickerName: (name: string) => void;
  clearSessions: () => void;
  getStats: () => PickerStats;
}

export const useAnalyticsStore = create<AnalyticsStoreState>()(
  persist(
    (set, get) => ({
      sessions: [],
      pickerName: '',

      recordSession: (record) => {
        set(state => ({
          sessions: [record, ...state.sessions].slice(0, 500),
        }));
      },

      setPickerName: (name) => set({pickerName: name}),

      clearSessions: () => set({sessions: []}),

      getStats: () => {
        const {sessions} = get();
        if (sessions.length === 0) {
          return {
            totalSessions: 0,
            totalItemsPicked: 0,
            avgTimePerItemMs: 0,
            accuracyRate: 0,
            sessionsToday: 0,
          };
        }

        const today = new Date().toISOString().slice(0, 10);
        const sessionsToday = sessions.filter(
          s => s.completedAt.slice(0, 10) === today,
        ).length;

        const totalItemsPicked = sessions.reduce(
          (sum, s) => sum + s.pickedCorrectly,
          0,
        );
        const totalItems = sessions.reduce(
          (sum, s) => sum + s.totalItems,
          0,
        );
        const totalDuration = sessions.reduce(
          (sum, s) => sum + s.durationMs,
          0,
        );

        return {
          totalSessions: sessions.length,
          totalItemsPicked,
          avgTimePerItemMs: totalItems > 0 ? totalDuration / totalItems : 0,
          accuracyRate: totalItems > 0 ? totalItemsPicked / totalItems : 0,
          sessionsToday,
        };
      },
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
