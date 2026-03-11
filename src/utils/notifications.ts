import {Platform, Vibration} from 'react-native';

export function vibrateSuccess(): void {
  if (Platform.OS === 'android') {
    Vibration.vibrate(100);
  } else {
    Vibration.vibrate([0, 50]);
  }
}

export function vibrateError(): void {
  Vibration.vibrate([0, 100, 50, 100]);
}
