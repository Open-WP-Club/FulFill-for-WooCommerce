import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage} from '../utils/storage';
import {resetApiClient} from '../api/client';

interface AuthState {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
  isAuthenticated: boolean;

  login: (siteUrl: string, consumerKey: string, consumerSecret: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      siteUrl: '',
      consumerKey: '',
      consumerSecret: '',
      isAuthenticated: false,

      login: (siteUrl, consumerKey, consumerSecret) => {
        set({siteUrl, consumerKey, consumerSecret, isAuthenticated: true});
        resetApiClient();
      },

      logout: () => {
        set({
          siteUrl: '',
          consumerKey: '',
          consumerSecret: '',
          isAuthenticated: false,
        });
        resetApiClient();
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
