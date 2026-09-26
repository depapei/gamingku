import { api } from "../lib/axios";
import type { AuthSession, Login, Register, SuccessResponse } from "../types/auth";

export const authService = {
  /**
   * Logs in and returns the access token + user; the refresh token
   * arrives as an httpOnly cookie (withCredentials).
   */
  login: async (payload: Login): Promise<SuccessResponse> => {
    const { data } = await api.post<SuccessResponse>("/auth/login", payload);
    return data;
  },

  /** Registers a new account; issues no token. */
  register: async (payload: Register) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  /**
   * Silently refreshes the session via the refresh cookie.
   * @returns the new access token
   */
  refresh: async (): Promise<string> => {
    const { data } = await api.post<{ success: boolean; accessToken: string }>(
      "/auth/refresh",
      {}
    );
    return data.accessToken;
  },

  /** Revokes the refresh session server-side and clears the cookie. */
  logout: async (): Promise<void> => {
    await api.post("/auth/logout", {});
  },
};

/** Re-exports the session shape for hook consumers. */
export type { AuthSession };
