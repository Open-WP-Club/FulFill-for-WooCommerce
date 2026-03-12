import Sound from 'react-native-sound';
import {vibrateSuccess, vibrateError} from './notifications';
import {useSettingsStore} from '../stores/settingsStore';

Sound.setCategory('Playback');

let successSound: Sound | null = null;
let errorSound: Sound | null = null;

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
}

export function releaseSounds(): void {
  successSound?.release();
  errorSound?.release();
  successSound = null;
  errorSound = null;
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
