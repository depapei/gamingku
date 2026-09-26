import { api } from "../lib/axios";
import type {
  AdminUserListParams,
  AdminUserListResponse,
  CreateUserInput,
  UpdateUserInput,
  User,
  UserMutationResponse,
} from "../types/user";

/**
 * Normalizes a numeric id for URL interpolation.
 * @param id user id
 * @returns id as string
 */
const toId = (id: number): string => String(id);

/** Client for admin user endpoints. */
export const userService = {
  /**
   * Fetches the paginated admin user list with server search/filter/sort.
   * @param params search, filter, sort and pagination options
   * @returns paginated users with total/page/limit
   */
  getAdminUsers: async (
    params?: AdminUserListParams,
  ): Promise<AdminUserListResponse> => {
    const { data } = await api.get("/admin/user/", {
      params: {
        search: params?.search || undefined,
        role: params?.role || undefined,
        isActive: params?.isActive,
        sortBy: params?.sortBy || undefined,
        sort: params?.sort || undefined,
        page: params?.page,
        limit: params?.limit,
      },
    });
    return {
      data: (data.data ?? []) as User[],
      total: Number(data.total ?? (data.data ?? []).length),
      page: Number(data.page ?? params?.page ?? 1),
      limit: Number(data.limit ?? params?.limit ?? 10),
    };
  },

  /**
   * Fetches a single admin user by id.
   * @param id user id
   * @returns user detail
   */
  getAdminUserById: async (id: number): Promise<User> => {
    const { data } = await api.get(`/admin/user/${toId(id)}`);
    return data.data as User;
  },

  /**
   * Creates a user as an admin.
   * @param payload create payload
   * @returns success envelope
   */
  createUser: async (
    payload: CreateUserInput,
  ): Promise<UserMutationResponse> => {
    const { data } = await api.post("/admin/user/", payload);
    return data as UserMutationResponse;
  },

  /**
   * Updates a user by route id.
   * @param payload update payload
   * @param id route id (source of truth)
   * @returns success envelope
   */
  updateUser: async (
    payload: UpdateUserInput,
    id: number,
  ): Promise<UserMutationResponse> => {
    const { data } = await api.put(`/admin/user/${toId(id)}`, {
      ...payload,
      id,
    });
    return data as UserMutationResponse;
  },

  /**
   * Activates or deactivates a user by id.
   * @param isActive target status
   * @param id user id
   * @returns success envelope
   */
  updateUserStatus: async (
    isActive: boolean,
    id: number,
  ): Promise<UserMutationResponse> => {
    const { data } = await api.put(`/admin/user/${toId(id)}/status`, {
      isActive,
    });
    return data as UserMutationResponse;
  },

  /**
   * Resets a user's password as an admin.
   * @param password new password (min 8 chars)
   * @param id user id
   * @returns success envelope
   */
  resetUserPassword: async (
    password: string,
    id: number,
  ): Promise<UserMutationResponse> => {
    const { data } = await api.put(`/admin/user/${toId(id)}/password`, {
      password,
    });
    return data as UserMutationResponse;
  },

  /**
   * Soft-deletes a user by id.
   * @param id user id
   * @returns success envelope
   */
  deleteUser: async (id: number): Promise<UserMutationResponse> => {
    const { data } = await api.delete(`/admin/user/${toId(id)}`);
    return data as UserMutationResponse;
  },
};
