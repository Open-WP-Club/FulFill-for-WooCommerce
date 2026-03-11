import {useState, useEffect, useCallback} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {useSyncStore} from '../stores/syncStore';
import {useSettingsStore} from '../stores/settingsStore';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const processQueue = useSyncStore(s => s.processQueue);
  const autoSyncEnabled = useSettingsStore(s => s.autoSyncEnabled);

  const handleConnectivityChange = useCallback(
    (connected: boolean) => {
      const wasOffline = !isConnected;
      setIsConnected(connected);

      if (wasOffline && connected && autoSyncEnabled) {
        processQueue();
      }
    },
    [isConnected, autoSyncEnabled, processQueue],
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, [handleConnectivityChange]);

  return {isConnected};
}
