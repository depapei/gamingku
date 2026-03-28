import { api } from "../lib/axios";
import { Login, Register } from "../types/auth";

export const authService = {
  login: async (payload: Login) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  register: async (payload: Register) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
};
