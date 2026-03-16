import RNShake from 'react-native-shake';

type ShakeCallback = () => void;

let activeSubscription: {remove: () => void} | null = null;
let callbacks: ShakeCallback[] = [];

function ensureListening() {
  if (activeSubscription) {
    return;
  }
  activeSubscription = RNShake.addListener(() => {
    for (const cb of callbacks) {
      cb();
    }
  });
}

function stopListening() {
  if (activeSubscription) {
    activeSubscription.remove();
    activeSubscription = null;
  }
}

export function subscribeShake(callback: ShakeCallback) {
  callbacks.push(callback);
  ensureListening();

  return {
    remove: () => {
      callbacks = callbacks.filter(cb => cb !== callback);
      if (callbacks.length === 0) {
        stopListening();
      }
    },
  };
}
