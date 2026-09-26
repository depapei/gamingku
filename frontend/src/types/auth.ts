export interface Login {
  email: string;
  password: string;
}

export interface Register {
  name: string;
  passsword: string;
  email: string;
  avatar?: string;
}

export type ErrorField = {
  field: string;
  message: string;
};

export type ErrorResponse = {
  message?: ErrorField[] | string;
  success?: boolean;
};

/** Authenticated user profile kept in the in-memory auth store. */
export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role: string;
}

/** Session written to the store after login: access token + user. */
export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface SuccessResponse {
  message: string;
  success: boolean;
  /** Short-lived access token (in-memory only, never localStorage). */
  accessToken: string;
  /** Authenticated user profile. */
  user: AuthUser;
  /** @deprecated Legacy single-token field; use accessToken instead. */
  token?: string;
}
