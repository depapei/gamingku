import { create } from 'zustand';
import { User } from '../types/user';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: 1, // numeric to match the admin User contract (was a string mock id)
    name: 'Admin User',
    email: 'admin@gamingku.com',
    role: 'admin',
    isActive: true, // required by the admin User contract
  }, // Mock logged in admin for demo
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
