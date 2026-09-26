import { create } from "zustand";
import type { AuthUser } from "../types/auth";

/** In-memory auth state: short-lived access token + user profile. */
interface AuthState {
  /** Short-lived JWT kept in memory only; null when logged out. */
  accessToken: string | null;
  /** Authenticated user profile; null when logged out. */
  user: AuthUser | null;
  /** True when both token and user are present. */
  isAuthenticated: boolean;
  /** Writes a full session after login (or boot rehydrate with decoded user). */
  setSession: (token: string, user: AuthUser) => void;
  /** Replaces the access token after a silent refresh, keeping the user. */
  setAccessToken: (token: string) => void;
  /** Clears the session on logout or failed refresh. */
  logout: () => void;
}

/**
 * In-memory auth store. Tokens never touch localStorage/sessionStorage;
 * the refresh token lives in an httpOnly cookie managed by the backend.
 * NOTE: store/userStore.ts is intentionally left untouched for compat.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setSession: (token, user) =>
    set({ accessToken: token, user, isAuthenticated: true }),
  setAccessToken: (token) =>
    set((s) => ({
      accessToken: token,
      isAuthenticated: token !== null && s.user !== null,
    })),
  logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
