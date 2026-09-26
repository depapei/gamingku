import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

/** Base URL for the backend API, overridable via VITE_API_URL. */
export const baseURL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_API_URL ?? "http://localhost:8080";

/** Shared Axios instance for all backend calls. */
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Reads the current access token from the in-memory auth store.
 * @returns bearer token or null when logged out
 * @deprecated Kept for compat; prefer useAuthStore.getState().accessToken.
 */
export const getStoredToken = (): string | null => {
  return useAuthStore.getState().accessToken;
};

/** Single-flight refresh promise shared by concurrent 401s. */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Reports whether a URL targets the auth endpoints that must never
 * trigger a refresh (prevents retry loops).
 * NOTE: /auth/logout is included though the FSD lists only
 * login/register/refresh — a 401 from logout must not start a refresh.
 */
export const isAuthPath = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
};

/**
 * Performs a single-flight refresh: concurrent callers share one
 * POST /auth/refresh (bare axios, cookie credentials). On success the
 * store token is updated; on failure the store is cleared and the user
 * is sent to login. Assumes the login route is /auth (App.tsx has no
 * /auth/login child route).
 */
export const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const token: string | undefined = res.data?.accessToken;
        if (token) {
          useAuthStore.getState().setAccessToken(token);
          return token;
        }
        useAuthStore.getState().logout();
        window.location.assign("/auth");
        return null;
      })
      .catch(() => {
        useAuthStore.getState().logout();
        window.location.assign("/auth");
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & RetryableConfig) | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthPath(original.url)
    ) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${token}`,
        };
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
