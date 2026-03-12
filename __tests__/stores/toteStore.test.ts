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

import {useToteStore} from '../../src/stores/toteStore';

describe('toteStore', () => {
  beforeEach(() => {
    useToteStore.setState({assignments: {}});
  });

  describe('assignTote', () => {
    it('assigns a tote to an order', () => {
      useToteStore.getState().assignTote(100, '1001', 'TOTE-A1');

      const assignment = useToteStore.getState().assignments[100];
      expect(assignment).toBeDefined();
      expect(assignment.toteBarcode).toBe('TOTE-A1');
      expect(assignment.orderId).toBe(100);
      expect(assignment.orderNumber).toBe('1001');
      expect(assignment.assignedAt).toBeTruthy();
      expect(assignment.verifiedAt).toBeUndefined();
    });

    it('overwrites existing tote assignment', () => {
      useToteStore.getState().assignTote(100, '1001', 'TOTE-A1');
      useToteStore.getState().assignTote(100, '1001', 'TOTE-B2');

      expect(useToteStore.getState().assignments[100].toteBarcode).toBe('TOTE-B2');
    });

    it('handles multiple orders', () => {
      useToteStore.getState().assignTote(100, '1001', 'TOTE-A1');
      useToteStore.getState().assignTote(200, '1002', 'TOTE-B2');

      expect(useToteStore.getState().assignments[100].toteBarcode).toBe('TOTE-A1');
      expect(useToteStore.getState().assignments[200].toteBarcode).toBe('TOTE-B2');
    });
  });

  describe('verifyTote', () => {
    it('returns true and sets verifiedAt on correct barcode', () => {
      useToteStore.getState().assignTote(100, '1001', 'TOTE-A1');

      const result = useToteStore.getState().verifyTote(100, 'TOTE-A1');

      expect(result).toBe(true);
      expect(useToteStore.getState().assignments[100].verifiedAt).toBeTruthy();
    });

    it('returns false on wrong barcode', () => {
      useToteStore.getState().assignTote(100, '1001', 'TOTE-A1');

      const result = useToteStore.getState().verifyTote(100, 'TOTE-WRONG');

      expect(result).toBe(false);
      expect(useToteStore.getState().assignments[100].verifiedAt).toBeUndefined();
    });

    it('returns false for unassigned order', () => {
      const result = useToteStore.getState().verifyTote(999, 'TOTE-A1');
      expect(result).toBe(false);
    });
  });

  describe('clearAssignment', () => {
    it('removes assignment for order', () => {
      useToteStore.getState().assignTote(100, '1001', 'TOTE-A1');
      useToteStore.getState().assignTote(200, '1002', 'TOTE-B2');

      useToteStore.getState().clearAssignment(100);

      expect(useToteStore.getState().assignments[100]).toBeUndefined();
      expect(useToteStore.getState().assignments[200]).toBeDefined();
    });

    it('does nothing for non-existent order', () => {
      useToteStore.getState().assignTote(100, '1001', 'TOTE-A1');
      useToteStore.getState().clearAssignment(999);

      expect(useToteStore.getState().assignments[100]).toBeDefined();
    });
  });
});
