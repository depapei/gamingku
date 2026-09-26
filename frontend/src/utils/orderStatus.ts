import type { OrderStatus } from "../types/order";

/** Tag color per order lifecycle status (shared by list, drawer, dashboard). */
const statusColors: Record<OrderStatus, string> = {
  pending: "gold",
  paid: "cyan",
  processing: "blue",
  completed: "green",
  cancelled: "red",
  refunded: "red",
};

/**
 * Resolves the antd Tag color for an order status.
 * @param status lifecycle status (unknown values fall back to default)
 * @returns antd Tag color name
 */
export const orderStatusColor = (status: string): string => {
  return (statusColors as Record<string, string>)[status] ?? "default";
};
