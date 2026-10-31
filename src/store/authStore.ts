import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Profile {
  id: string;
  nickname: string;
  school?: string | null;
  rating: number;
  games_played: number;
}

interface AuthState {
  profile: Profile | null;
  accessToken: string | null;
  setProfile: (profile: Profile) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      accessToken: null,
      setProfile: (profile) => set({ profile }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clear: () => set({ profile: null, accessToken: null }),
    }),
    {
      name: 'study-clash-auth',
      partialize: (state) => ({ profile: state.profile, accessToken: state.accessToken }),
    }
  )
);
