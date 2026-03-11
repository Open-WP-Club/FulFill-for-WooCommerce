import {useEffect} from 'react';
import {useSyncStore} from '../stores/syncStore';
import {useNetworkStatus} from './useNetworkStatus';

export function useSync() {
  const {isConnected} = useNetworkStatus();
  const queue = useSyncStore(s => s.queue);
  const isSyncing = useSyncStore(s => s.isSyncing);
  const lastSyncAt = useSyncStore(s => s.lastSyncAt);
  const processQueue = useSyncStore(s => s.processQueue);

  useEffect(() => {
    if (isConnected && queue.length > 0 && !isSyncing) {
      processQueue();
    }
  }, [isConnected, queue.length, isSyncing, processQueue]);

  return {
    pendingCount: queue.length,
    isSyncing,
    lastSyncAt,
    isConnected,
  };
}
