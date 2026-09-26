import { api } from "../lib/axios";
import type {
  CreateOrderInput,
  Order,
  OrderListParams,
  OrderMutationResponse,
  OrderStatus,
  PaginatedOrders,
} from "../types/order";

/** Client for public checkout and admin order endpoints. */
export const orderService = {
  /**
   * Fetches the paginated admin order list with server search/filter/sort.
   * @param params search, filter, sort and pagination options
   * @returns paginated orders with total/page/limit
   */
  getAdminOrders: async (params?: OrderListParams): Promise<PaginatedOrders> => {
    const { data } = await api.get("/admin/order/", {
      params: {
        search: params?.search || undefined,
        status: params?.status || undefined,
        userId: params?.userId ?? undefined,
        dateFrom: params?.dateFrom || undefined,
        dateTo: params?.dateTo || undefined,
        sortBy: params?.sortBy || undefined,
        sort: params?.sort || undefined,
        page: params?.page,
        limit: params?.limit,
      },
    });
    return {
      data: (data.data ?? []) as Order[],
      total: Number(data.total ?? (data.data ?? []).length),
      page: Number(data.page ?? params?.page ?? 1),
      limit: Number(data.limit ?? params?.limit ?? 10),
    };
  },

  /**
   * Fetches a single admin order with items, product and variant names.
   * @param id order id
   * @returns order detail
   */
  getAdminOrderById: async (id: number): Promise<Order> => {
    const { data } = await api.get(`/admin/order/${id}`);
    return data.data as Order;
  },

  /**
   * Creates a customer order. Totals and the order number are server-derived.
   * @param payload checkout payload
   * @returns created identity envelope
   */
  createOrder: async (
    payload: CreateOrderInput,
  ): Promise<OrderMutationResponse> => {
    const { data } = await api.post("/order/", payload);
    return data as OrderMutationResponse;
  },

  /**
   * Moves an order to a new lifecycle status (transition-guarded server-side).
   * @param id order id
   * @param status target status
   * @returns success envelope
   */
  updateOrderStatus: async (
    id: number,
    status: OrderStatus,
  ): Promise<OrderMutationResponse> => {
    const { data } = await api.patch(`/admin/order/${id}/status`, { status });
    return data as OrderMutationResponse;
  },

  /**
   * Soft-deletes an order by id.
   * @param id order id
   * @returns success envelope
   */
  deleteOrder: async (id: number): Promise<OrderMutationResponse> => {
    const { data } = await api.delete(`/admin/order/${id}`);
    return data as OrderMutationResponse;
  },
};
