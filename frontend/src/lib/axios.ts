import axios from "axios";

/** Base URL for the backend API, overridable via VITE_API_URL. */
const baseURL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_API_URL ?? "http://localhost:8080";

/** Shared Axios instance for all backend calls. */
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Reads the stored JWT from localStorage.
 * Login persists the raw token string (JSON-encoded) under the "user" key.
 * @returns bearer token or null when logged out
 */
export const getStoredToken = (): string | null => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "string" && parsed.length > 0) return parsed;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "token" in parsed &&
      typeof (parsed as { token: unknown }).token === "string"
    ) {
      return (parsed as { token: string }).token;
    }
    return null;
  } catch {
    return null;
  }
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
