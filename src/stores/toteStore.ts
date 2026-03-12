import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../utils/storage';

export interface ToteAssignment {
  toteBarcode: string;
  orderId: number;
  orderNumber: string;
  assignedAt: string;
  verifiedAt?: string;
}

interface ToteStoreState {
  assignments: Record<number, ToteAssignment>;

  assignTote: (orderId: number, orderNumber: string, toteBarcode: string) => void;
  verifyTote: (orderId: number, scannedBarcode: string) => boolean;
  clearAssignment: (orderId: number) => void;
}

export const useToteStore = create<ToteStoreState>()(
  persist(
    (set, get) => ({
      assignments: {},

      assignTote: (orderId, orderNumber, toteBarcode) => {
        set(state => ({
          assignments: {
            ...state.assignments,
            [orderId]: {
              toteBarcode,
              orderId,
              orderNumber,
              assignedAt: new Date().toISOString(),
            },
          },
        }));
      },

      verifyTote: (orderId, scannedBarcode) => {
        const assignment = get().assignments[orderId];
        if (!assignment || assignment.toteBarcode !== scannedBarcode) {
          return false;
        }
        set(state => ({
          assignments: {
            ...state.assignments,
            [orderId]: {
              ...assignment,
              verifiedAt: new Date().toISOString(),
            },
          },
        }));
        return true;
      },

      clearAssignment: (orderId) => {
        set(state => {
          const {[orderId]: _, ...rest} = state.assignments;
          return {assignments: rest};
        });
      },
    }),
    {
      name: 'tote-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
