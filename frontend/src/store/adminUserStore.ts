import { create } from "zustand";
import type { UserRole } from "../types/user";

/**
 * Ephemeral admin-users table UI state only (search, filters, pagination,
 * sorter). Session/auth state lives in the auth track
 * (`store/authStore.ts`, `store/userStore.ts`) which this file must not
 * import or duplicate.
 */

/** Sorter snapshot for server-driven table sorting. */
export interface AdminUserSorter {
  sortBy?: string;
  sort?: "asc" | "desc";
}

/** Table UI state plus setters for the admin users page. */
interface AdminUserState {
  /** Debounced server search text. */
  search?: string;
  /** Server role filter. */
  role?: UserRole;
  /** Server active-status filter. */
  isActive?: boolean;
  /** Current page (1-based). */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Server sorter snapshot. */
  sorter: AdminUserSorter;
  /** Sets the search text and resets to page 1. */
  setSearch: (search: string | undefined) => void;
  /** Sets the role filter and resets to page 1. */
  setRole: (role: UserRole | undefined) => void;
  /** Sets the active-status filter and resets to page 1. */
  setIsActive: (isActive: boolean | undefined) => void;
  /** Sets the current page. */
  setPage: (page: number) => void;
  /** Sets the page size and resets to page 1. */
  setPageSize: (pageSize: number) => void;
  /** Sets the sorter snapshot. */
  setSorter: (sorter: AdminUserSorter) => void;
  /** Clears all filters and restores default pagination. */
  resetFilters: () => void;
}

/**
 * Zustand store holding only the admin users table UI state.
 * @returns admin users table state hook
 */
export const useAdminUserStore = create<AdminUserState>((set) => ({
  search: undefined,
  role: undefined,
  isActive: undefined,
  page: 1,
  pageSize: 10,
  sorter: {},
  setSearch: (search) => set({ search, page: 1 }),
  setRole: (role) => set({ role, page: 1 }),
  setIsActive: (isActive) => set({ isActive, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setSorter: (sorter) => set({ sorter }),
  resetFilters: () =>
    set({
      search: undefined,
      role: undefined,
      isActive: undefined,
      page: 1,
      pageSize: 10,
      sorter: {},
    }),
}));
