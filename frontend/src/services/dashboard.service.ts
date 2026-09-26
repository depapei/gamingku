import { api } from "../lib/axios";
import type { DashboardSummary } from "../types/dashboard";

/** Zero-value fallback so Statistic components never render NaN. */
const emptySummary: DashboardSummary = {
  revenue: { total: 0, month: 0, currency: "IDR" },
  counts: { orders: 0, products: 0, users: 0, categories: 0 },
  ordersByStatus: {
    pending: 0,
    paid: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
  },
  recentOrders: [],
  lowStock: [],
};

/** Client for the admin dashboard summary endpoint. */
export const dashboardService = {
  /**
   * Fetches the admin dashboard summary (counts, revenue, recent orders, low stock).
   * @returns dashboard summary with zero fallbacks on partial payloads
   */
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get("/admin/dashboard/summary");
    const data = res.data?.data as Partial<DashboardSummary> | undefined;
    if (!data) return emptySummary;
    return {
      revenue: {
        total: Number(data.revenue?.total ?? 0),
        month: Number(data.revenue?.month ?? 0),
        currency: data.revenue?.currency ?? "IDR",
      },
      counts: {
        orders: Number(data.counts?.orders ?? 0),
        products: Number(data.counts?.products ?? 0),
        users: Number(data.counts?.users ?? 0),
        categories: Number(data.counts?.categories ?? 0),
      },
      ordersByStatus: {
        pending: Number(data.ordersByStatus?.pending ?? 0),
        paid: Number(data.ordersByStatus?.paid ?? 0),
        processing: Number(data.ordersByStatus?.processing ?? 0),
        completed: Number(data.ordersByStatus?.completed ?? 0),
        cancelled: Number(data.ordersByStatus?.cancelled ?? 0),
        refunded: Number(data.ordersByStatus?.refunded ?? 0),
      },
      recentOrders: data.recentOrders ?? [],
      lowStock: data.lowStock ?? [],
    };
  },
};
