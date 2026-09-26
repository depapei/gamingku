import { create } from "zustand";
import type { OrderStatus } from "../types/order";

/** Filter state for the admin orders table (UI-only, no server data). */
export interface OrderFilters {
  /** Free-text query matched server-side. */
  search?: string;
  /** Lifecycle status filter. */
  status?: OrderStatus | string;
  /** Inclusive date range as [from, to] (YYYY-MM-DD). */
  dateRange?: [string, string];
}

/** Pagination state for the admin orders table. */
export interface OrderPagination {
  /** 1-based current page. */
  current: number;
  /** Page size. */
  pageSize: number;
}

/** UI-only state for the admin orders page; server data lives in TanStack Query. */
interface OrderState {
  /** Active table filters. */
  filters: OrderFilters;
  /** Active table pagination. */
  pagination: OrderPagination;
  /** Order selected for the detail drawer. */
  selectedId: number | null;
  /** Detail drawer visibility. */
  isDetailOpen: boolean;
  /** Status modal visibility. */
  isStatusOpen: boolean;
  /** Merges partial filters and resets to the first page. */
  setFilters: (filters: Partial<OrderFilters>) => void;
  /** Replaces pagination state. */
  setPagination: (pagination: OrderPagination) => void;
  /** Opens the detail drawer for an order. */
  openDetail: (id: number) => void;
  /** Closes the detail drawer. */
  closeDetail: () => void;
  /** Opens the status modal for an order. */
  openStatus: (id: number) => void;
  /** Closes the status modal. */
  closeStatus: () => void;
  /** Resets filters, pagination and selection. */
  reset: () => void;
}

/** Initial pagination for the admin orders table. */
const initialPagination: OrderPagination = { current: 1, pageSize: 10 };

/**
 * UI-only Zustand store for the admin orders page.
 * NOTE: holds filters/pagination/selection only; order rows are cached
 * by TanStack Query (see hooks/useOrders.ts).
 */
export const useOrderStore = create<OrderState>((set) => ({
  filters: {},
  pagination: initialPagination,
  selectedId: null,
  isDetailOpen: false,
  isStatusOpen: false,
  setFilters: (filters) =>
    set((s) => ({
      filters: { ...s.filters, ...filters },
      pagination: { ...s.pagination, current: 1 },
    })),
  setPagination: (pagination) => set({ pagination }),
  openDetail: (id) => set({ selectedId: id, isDetailOpen: true }),
  closeDetail: () => set({ isDetailOpen: false, selectedId: null }),
  openStatus: (id) => set({ selectedId: id, isStatusOpen: true }),
  closeStatus: () => set({ isStatusOpen: false, selectedId: null }),
  reset: () =>
    set({
      filters: {},
      pagination: initialPagination,
      selectedId: null,
      isDetailOpen: false,
      isStatusOpen: false,
    }),
}));
