import Sound from 'react-native-sound';
import {Vibration} from 'react-native';
import {vibrateSuccess, vibrateError} from './notifications';
import {useSettingsStore} from '../stores/settingsStore';
import type {WcOrderStatus} from '../types/order';

Sound.setCategory('Playback');

let successSound: Sound | null = null;
let errorSound: Sound | null = null;
let completeSound: Sound | null = null;

export function initSounds(): void {
  successSound = new Sound('scan_success.mp3', Sound.MAIN_BUNDLE, err => {
    if (err) {
      successSound = null;
    }
  });
  errorSound = new Sound('scan_error.mp3', Sound.MAIN_BUNDLE, err => {
    if (err) {
      errorSound = null;
    }
  });
  completeSound = new Sound('order_complete.mp3', Sound.MAIN_BUNDLE, err => {
    if (err) {
      // Fallback to success sound if complete sound doesn't exist
      completeSound = null;
    }
  });
}

export function releaseSounds(): void {
  successSound?.release();
  errorSound?.release();
  completeSound?.release();
  successSound = null;
  errorSound = null;
  completeSound = null;
}

export function playSuccessFeedback(): void {
  const {soundEnabled, hapticEnabled} = useSettingsStore.getState();
  if (hapticEnabled) {
    vibrateSuccess();
  }
  if (soundEnabled && successSound) {
    successSound.stop(() => {
      successSound?.play();
    });
  }
}

export function playErrorFeedback(): void {
  const {soundEnabled, hapticEnabled} = useSettingsStore.getState();
  if (hapticEnabled) {
    vibrateError();
  }
  if (soundEnabled && errorSound) {
    errorSound.stop(() => {
      errorSound?.play();
    });
  }
}

const STATUS_VIBRATION_PATTERNS: Partial<Record<WcOrderStatus, number[]>> = {
  completed: [0, 80, 60, 80, 60, 80], // triple pulse
  processing: [0, 120],                // single long
  'on-hold': [0, 60, 80, 60],          // double short
  cancelled: [0, 200, 100, 200],       // double long (warning)
  failed: [0, 100, 50, 100, 50, 100],  // triple fast (error)
};

export function playStatusFeedback(status: WcOrderStatus): void {
  const {soundEnabled, hapticEnabled} = useSettingsStore.getState();

  if (hapticEnabled) {
    const pattern = STATUS_VIBRATION_PATTERNS[status];
    if (pattern) {
      Vibration.vibrate(pattern);
    } else {
      vibrateSuccess();
    }
  }

  if (soundEnabled) {
    if (status === 'completed' && completeSound) {
      completeSound.stop(() => completeSound?.play());
    } else if (
      status === 'cancelled' ||
      status === 'failed'
    ) {
      if (errorSound) {
        errorSound.stop(() => errorSound?.play());
      }
    } else if (successSound) {
      successSound.stop(() => successSound?.play());
    }
  }
}
