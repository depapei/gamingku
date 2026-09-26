import { api } from "../lib/axios";
import { User } from "../types/user";

/** Response envelope for user mutations. */
interface UserMutationResponse {
  success: boolean;
  message: string;
}

/** Client for admin user endpoints. */
export const userService = {
  /**
   * Fetches the admin user list.
   * @returns users
   */
  getUsers: async (): Promise<User[]> => {
    const { data } = await api("/admin/user/");
    return data.data as User[];
  },

  /**
   * Creates a user.
   * @param payload user payload
   * @returns success envelope
   */
  createUser: async (payload: User): Promise<UserMutationResponse> => {
    const { data } = await api.post("/admin/user/", payload);
    return data as UserMutationResponse;
  },

  /**
   * Updates a user by id.
   * @param payload user payload
   * @param id user id
   * @returns success envelope
   */
  updateUser: async (
    payload: User,
    id: number,
  ): Promise<UserMutationResponse> => {
    const { data } = await api.put(`/admin/user/${id}`, payload);
    return data as UserMutationResponse;
  },

  /**
   * Deletes a user by id.
   * @param id user id
   * @returns success envelope
   */
  deleteUser: async (id: number): Promise<UserMutationResponse> => {
    const { data } = await api.delete(`/admin/user/${id}`);
    return data as UserMutationResponse;
  },
};
