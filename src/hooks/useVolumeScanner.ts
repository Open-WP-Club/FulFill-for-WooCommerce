import {useEffect} from 'react';
import {
  VolumeManager,
} from 'react-native-volume-manager';

interface UseVolumeScannerOptions {
  onTrigger: () => void;
  enabled?: boolean;
}

export function useVolumeScanner({
  onTrigger,
  enabled = true,
}: UseVolumeScannerOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener = VolumeManager.addVolumeListener(result => {
      // Any volume button press triggers the callback
      onTrigger();
    });

    return () => {
      listener.remove();
    };
  }, [onTrigger, enabled]);
}
