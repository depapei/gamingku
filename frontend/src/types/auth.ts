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

export type ErrorResponse = {
  message?: string;
  success?: boolean;
};

export interface SuccessResponse {
  message: string;
  success: boolean;
  token: string;
}
