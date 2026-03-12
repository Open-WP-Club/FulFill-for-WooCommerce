export interface PickSessionRecord {
  sessionId: string;
  orderId: number;
  orderNumber: string;
  startedAt: string;
  completedAt: string;
  totalItems: number;
  pickedCorrectly: number;
  markedMissing: number;
  markedDamaged: number;
  durationMs: number;
}

export interface PickerStats {
  totalSessions: number;
  totalItemsPicked: number;
  avgTimePerItemMs: number;
  accuracyRate: number;
  sessionsToday: number;
}
