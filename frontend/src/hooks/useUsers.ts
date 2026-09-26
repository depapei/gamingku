import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import type {
  AdminUserListParams,
  CreateUserInput,
  UpdateUserInput,
} from "../types/user";
import { queryClient } from "../lib/queryClient";

/** Query keys isolating the admin users cache from any public cache. */
export const userKeys = {
  /** Admin list key parameterized by table params. */
  adminList: (params?: AdminUserListParams) =>
    ["admin", "users", params ?? {}] as const,
  /** Admin detail key for a single user. */
  adminDetail: (id: number | undefined) => ["admin", "users", id] as const,
};

/** Variables accepted by the update mutation (payload plus route id). */
export interface UpdateUserVariables {
  /** Route id, the source of truth. */
  id: number;
  /** Update payload. */
  payload: UpdateUserInput;
}

/** Variables accepted by the status mutation (target flag plus user id). */
export interface UpdateUserStatusVariables {
  /** Target active flag. */
  isActive: boolean;
  /** User id. */
  id: number;
}

/** Variables accepted by the password-reset mutation. */
export interface ResetUserPasswordVariables {
  /** New password (min 8 chars). */
  password: string;
  /** User id. */
  id: number;
}

/**
 * Fetches the paginated admin user list with server search/filter/sort.
 * @param params search, filter, sort and pagination options
 * @returns paginated query result keeping previous page data
 */
export const useAdminUsers = (params?: AdminUserListParams) => {
  return useQuery({
    queryKey: userKeys.adminList(params),
    queryFn: () => userService.getAdminUsers(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Fetches a single admin user.
 * @param id user id
 * @returns detail query result, disabled when id is missing
 */
export const useUserDetail = (id: number | undefined) => {
  return useQuery({
    queryKey: userKeys.adminDetail(id),
    queryFn: () => userService.getAdminUserById(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
};

/**
 * Creates a user and refreshes the admin users cache.
 * @returns mutation for user creation
 */
export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (payload: CreateUserInput) =>
      userService.createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

/**
 * Updates a user and refreshes the admin users cache.
 * @returns mutation for user updates
 */
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ id, payload }: UpdateUserVariables) =>
      userService.updateUser(payload, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

/**
 * Toggles a user's active status and refreshes the admin users cache.
 * @returns mutation for status changes
 */
export const useUpdateUserStatus = () => {
  return useMutation({
    mutationFn: async ({ isActive, id }: UpdateUserStatusVariables) =>
      userService.updateUserStatus(isActive, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

/**
 * Resets a user's password and refreshes the admin users cache.
 * @returns mutation for password resets
 */
export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: async ({ password, id }: ResetUserPasswordVariables) =>
      userService.resetUserPassword(password, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

/**
 * Deletes a user and refreshes the admin users cache.
 * @returns mutation for user deletion
 */
export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: number) => userService.deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};
