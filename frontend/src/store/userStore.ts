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
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@gamingku.com',
    role: 'admin',
  }, // Mock logged in admin for demo
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
