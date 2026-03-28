import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { Login, Register } from "../types/auth";

export const authLogin = () => {
  return useMutation({
    mutationFn: async (payload: Login) => authService.login(payload),
  });
};

export const authRegister = () => {
  return useMutation({
    mutationFn: async (payload: Register) => authService.register(payload),
  });
};
