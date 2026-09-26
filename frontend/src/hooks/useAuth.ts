import { useMutation, useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { queryClient } from "../lib/queryClient";
import type { AuthUser, Login, Register, SuccessResponse } from "../types/auth";

/** Access-token claims minted by the backend (see JwtClaim). */
interface AccessClaims {
  user_id?: number;
  user_email?: string;
  user_role?: string;
}

/**
 * Derives a store user from an access token.
 * Assumption: /auth/refresh returns only {accessToken}, so the boot
 * session reconstructs the user by decoding the JWT; name falls back to
 * the email local-part since the claim carries no name.
 */
export const userFromAccessToken = (token: string): AuthUser => {
  const claims = jwtDecode<AccessClaims>(token);
  const email = claims.user_email ?? "";
  return {
    id: claims.user_id ?? email,
    name: email.split("@")[0] || email,
    email,
    role: claims.user_role ?? "",
  };
};

/**
 * Login mutation; writes the session to the in-memory store on success.
 * The refresh token is cookie-bound and never touches JS.
 */
export const authLogin = () => {
  return useMutation({
    mutationFn: async (payload: Login) => authService.login(payload),
    onSuccess: (res: SuccessResponse) => {
      if (res?.accessToken && res?.user) {
        useAuthStore.getState().setSession(res.accessToken, res.user);
      }
    },
  });
};

/** Registration mutation (issues no token; caller logs in after). */
export const authRegister = () => {
  return useMutation({
    mutationFn: async (payload: Register) => authService.register(payload),
  });
};

/**
 * Logout mutation; calls the backend to revoke the refresh session,
 * then clears the store and react-query cache on settle.
 */
export const authLogout = () => {
  return useMutation({
    mutationFn: async () => authService.logout(),
    onSettled: () => {
      useAuthStore.getState().logout();
      queryClient.clear();
    },
  });
};

/**
 * Boot rehydration: when the store has no access token (fresh reload),
 * attempts one silent refresh via the httpOnly cookie. Logged-out users
 * (no cookie) stay logged out with no toast. Gate splash UI on isFetching.
 */
export const useBootSession = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["auth", "boot"],
    enabled: accessToken === null,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      const token = await authService.refresh();
      const existing = useAuthStore.getState().user;
      if (existing) {
        useAuthStore.getState().setAccessToken(token);
      } else {
        useAuthStore.getState().setSession(token, userFromAccessToken(token));
      }
      return token;
    },
  });
};
