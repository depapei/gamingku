export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  avatar?: string;
}

export interface Token {
  user_role?: "admin" | "customer";
  user_email?: string;
}
