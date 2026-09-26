/** Revenue totals for the admin dashboard overview. */
export interface RevenueSummary {
  /** All-time sum of orders total_price. */
  total: number;
  /** Month-to-date sum of orders total_price. */
  month: number;
  /** Presentation-only currency code. */
  currency: string;
}

/** Entity counts for the admin dashboard overview. */
export interface CountSummary {
  /** Total non-deleted orders. */
  orders: number;
  /** Total non-deleted products. */
  products: number;
  /** Total non-deleted users. */
  users: number;
  /** Total non-deleted categories. */
  categories: number;
}

/** Order counts per canonical lifecycle status. */
export interface OrdersByStatus {
  /** Number of pending orders. */
  pending: number;
  /** Number of paid orders. */
  paid: number;
  /** Number of processing orders. */
  processing: number;
  /** Number of completed orders. */
  completed: number;
  /** Number of cancelled orders. */
  cancelled: number;
  /** Number of refunded orders. */
  refunded: number;
}

/** Compact read model for the recent-orders list. */
export interface RecentOrderItem {
  /** Order primary key. */
  id: number;
  /** Server-generated order number. */
  orderNumber: string;
  /** Customer display name. */
  customer: string;
  /** Lifecycle status. */
  status: string;
  /** Order total price. */
  totalPrice: number;
  /** Creation timestamp (ISO). */
  createdAt: string;
}

/** Compact read model for the low-stock list. */
export interface LowStockItem {
  /** Product primary key. */
  id: number;
  /** Product name. */
  name: string;
  /** Product unique slug. */
  slug: string;
  /** Current stock. */
  stock: number;
  /** Product price. */
  price: number;
}

/** GET /admin/dashboard/summary response payload. */
export interface DashboardSummary {
  /** Revenue aggregates. */
  revenue: RevenueSummary;
  /** Entity counts. */
  counts: CountSummary;
  /** Orders per status. */
  ordersByStatus: OrdersByStatus;
  /** Five most recent orders. */
  recentOrders: RecentOrderItem[];
  /** Five lowest-stock products. */
  lowStock: LowStockItem[];
}
