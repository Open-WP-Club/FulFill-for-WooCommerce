import {createMMKV} from 'react-native-mmkv';
import type {StateStorage} from 'zustand/middleware';

export const mmkv = createMMKV();

export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkv.set(name, value);
  },
  removeItem: (name: string) => {
    mmkv.remove(name);
  },
};
