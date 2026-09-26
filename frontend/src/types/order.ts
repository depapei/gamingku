/** Order lifecycle status shared by admin list, drawer and status modal. */
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

/** Payment methods accepted at checkout. */
export type PaymentMethod = "cod" | "transfer" | "ewallet" | "qris";

/** Single order line with denormalized product and variant names. */
export interface OrderItem {
  /** Line id (present on read models). */
  id?: number;
  /** Referenced product id. */
  productId: number;
  /** Denormalized product name for display. */
  productName?: string;
  /** Ordered quantity. */
  qty: number;
  /** Unit price at order time. */
  price: number;
  /** Selected variant option ids. */
  variantIds?: number[];
  /** Resolved variant option names for display. */
  variantNames?: string[];
}

/** Canonical admin order read model. */
export interface Order {
  /** Row id. */
  id: number;
  /** Server-generated ORD-YYYYMMDD-XXXX identifier. */
  orderNumber: string;
  /** Owning user id, when the order was placed signed-in. */
  userId?: number;
  /** Customer display name. */
  customer: string;
  /** Delivery address. */
  address: string;
  /** Customer email. */
  email: string;
  /** Lifecycle status. */
  status: OrderStatus;
  /** Order lines with product/variant names. */
  items: OrderItem[];
  /** Server-computed order total. */
  totalAmount: number;
  /** Payment method used. */
  paymentMethod: string;
  /** Creation timestamp (ISO). */
  createdAt: string;
  /** Last update timestamp (ISO). */
  updatedAt: string;
}

/** Single line in a create-order payload. */
export interface CreateOrderItemInput {
  /** Referenced product id. */
  productId: number;
  /** Ordered quantity (> 0). */
  qty: number;
  /** Unit price (server recomputes the total; sent for record). */
  price: number;
  /** Selected variant option ids. */
  variantIds?: number[];
}

/** Payload for customer checkout (POST /order/). */
export interface CreateOrderInput {
  /** Customer name (min 3). */
  customer: string;
  /** Delivery address. */
  address: string;
  /** Customer email. */
  email: string;
  /** At least one order line. */
  items: CreateOrderItemInput[];
  /** Payment method, defaults to cod. */
  paymentMethod?: PaymentMethod;
  /** Owning user id, when placed signed-in. */
  userId?: number;
}

/** Payload for PATCH /admin/order/:id/status. */
export interface UpdateOrderStatusInput {
  /** Target lifecycle status. */
  status: OrderStatus;
}

/** Server-driven list/filter/sort/pagination options. */
export interface OrderListParams {
  /** Matches customer, order number or status. */
  search?: string;
  /** Lifecycle status filter. */
  status?: OrderStatus | string;
  /** Owner filter. */
  userId?: number;
  /** Inclusive start (YYYY-MM-DD). */
  dateFrom?: string;
  /** Inclusive end (YYYY-MM-DD). */
  dateTo?: string;
  /** Sort key: createdAt | totalPrice | customer | status. */
  sortBy?: string;
  /** Sort direction. */
  sort?: "asc" | "desc";
  /** 1-based page. */
  page?: number;
  /** Page size (1..50). */
  limit?: number;
}

/** Paginated admin order list envelope. */
export interface PaginatedOrders {
  /** Current page rows. */
  data: Order[];
  /** Total matching rows. */
  total: number;
  /** Current page. */
  page: number;
  /** Page size. */
  limit: number;
}

/** Mutation envelope for create/status/delete operations. */
export interface OrderMutationResponse {
  /** Always true on success. */
  success: boolean;
  /** Human-readable result message. */
  message: string;
  /** Created identity for POST /order/. */
  data?: { id: number; orderNumber: string };
}
