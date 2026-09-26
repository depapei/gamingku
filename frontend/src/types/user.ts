/** Admin-manageable user role, ordered superadmin > admin > customer. */
export type UserRole = "superadmin" | "admin" | "customer";

/** Canonical user read model shared by the admin users table and detail views. */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Payload for admin-driven user creation. */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
  avatar?: string;
}

/** Payload for updating a user. Route :id remains the source of truth. */
export interface UpdateUserInput {
  id?: number;
  name?: string;
  email?: string;
  role?: UserRole;
  avatar?: string;
}

/** Server-driven query options for the admin users table. */
export interface AdminUserListParams {
  search?: string;
  role?: UserRole | string;
  isActive?: boolean;
  sortBy?: string;
  sort?: "asc" | "desc" | string;
  page?: number;
  limit?: number;
}

/** Paginated admin list response envelope. */
export interface AdminUserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

/** Mutation response envelope returned by create/update/status/password/delete endpoints. */
export interface UserMutationResponse {
  success: boolean;
  message: string;
}

/** Legacy token-claims snapshot kept for compat with older imports. */
export interface Token {
  user_role?: UserRole | string;
  user_email?: string;
}
