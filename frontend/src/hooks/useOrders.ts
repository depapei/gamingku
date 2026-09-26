import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { orderService } from "../services/order.service";
import { queryClient } from "../lib/queryClient";
import type {
  CreateOrderInput,
  Order,
  OrderListParams,
  OrderStatus,
} from "../types/order";

/** Query keys separating the admin orders list from detail entries. */
export const orderKeys = {
  /** Base key for all admin order queries. */
  admin: ["admin", "orders"] as const,
  /** Admin list key parameterized by table params. */
  adminList: (params?: OrderListParams) =>
    ["admin", "orders", params ?? {}] as const,
  /** Admin detail key for a single order. */
  adminDetail: (id: number | null) => ["admin", "orders", id] as const,
};

/** Legal successors per order lifecycle status (mirrors the backend guard). */
export const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "refunded", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

/**
 * Fetches the paginated admin order list with server search/filter/sort.
 * @param params search, filter, sort and pagination options
 * @returns paginated query result keeping previous page data
 */
export const useAdminOrders = (params?: OrderListParams) => {
  return useQuery({
    queryKey: orderKeys.adminList(params),
    queryFn: () => orderService.getAdminOrders(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Fetches a single admin order with items and variant names.
 * @param id order id
 * @returns detail query result, disabled when id is missing
 */
export const useAdminOrderDetail = (id: number | null) => {
  return useQuery({
    queryKey: orderKeys.adminDetail(id),
    queryFn: () => orderService.getAdminOrderById(id as number),
    enabled: typeof id === "number" && id > 0,
  });
};

/**
 * Creates a customer order and refreshes the admin list cache.
 * @returns mutation for order creation
 */
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (payload: CreateOrderInput) =>
      orderService.createOrder(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.admin });
    },
  });
};

/**
 * Moves an order to a new status with an optimistic patch and rollback.
 * @returns mutation for status updates
 */
export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: OrderStatus;
    }) => orderService.updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.admin });
      const previousList = queryClient.getQueriesData({
        queryKey: orderKeys.admin,
      });
      queryClient.setQueriesData<{ data?: Order[] }>(
        { queryKey: orderKeys.admin },
        (old) => {
          if (!old || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: (old.data as Order[]).map((o) =>
              o.id === id ? { ...o, status } : o,
            ),
          };
        },
      );
      const previousDetail = queryClient.getQueryData<Order>(
        orderKeys.adminDetail(id),
      );
      if (previousDetail) {
        queryClient.setQueryData<Order>(orderKeys.adminDetail(id), {
          ...previousDetail,
          status,
        });
      }
      return { previousList, previousDetail };
    },
    onError: (_err, { id }, context) => {
      context?.previousList.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(
          orderKeys.adminDetail(id),
          context.previousDetail,
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.admin });
    },
  });
};

/**
 * Soft-deletes an order and refreshes the admin list cache.
 * @returns mutation for order deletion
 */
export const useDeleteOrder = () => {
  return useMutation({
    mutationFn: async (id: number) => orderService.deleteOrder(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.admin });
    },
  });
};
