export type MutationType =
  | 'UPDATE_ORDER_STATUS'
  | 'ADD_ORDER_NOTE'
  | 'UPDATE_TRACKING'
  | 'UPDATE_STOCK';

export interface QueuedMutation {
  id: string;
  type: MutationType;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

export interface SyncState {
  queue: QueuedMutation[];
  isSyncing: boolean;
  lastSyncAt?: string;
}
