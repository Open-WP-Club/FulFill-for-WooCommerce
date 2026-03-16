import {useEffect, useRef, useCallback} from 'react';
import {Alert} from 'react-native';
import {subscribeShake} from '../utils/accelerometer';

interface UseShakeUndoOptions {
  onUndo: () => void;
  label?: string;
  enabled?: boolean;
}

export function useShakeUndo({
  onUndo,
  label = 'Undo last action?',
  enabled = true,
}: UseShakeUndoOptions) {
  const lastShakeRef = useRef(0);
  const onUndoRef = useRef(onUndo);
  onUndoRef.current = onUndo;

  const handleShake = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeRef.current < 3000) {
      return;
    }
    lastShakeRef.current = now;
    Alert.alert('Shake Detected', label, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Undo', style: 'destructive', onPress: () => onUndoRef.current()},
    ]);
  }, [label]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const sub = subscribeShake(handleShake);
    return () => sub.remove();
  }, [enabled, handleShake]);
}
