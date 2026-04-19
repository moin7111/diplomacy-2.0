import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Diplomacy 2.0 — Auth State Store
 */

export interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "diplomacy2-auth-storage", // prefix im localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
