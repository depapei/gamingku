import { Alert, Descriptions, Drawer, Skeleton, Table, Tag } from "antd";
import { formatPrice } from "../../utils/formatPrice";
import { getApiErrorMessage } from "../../utils/slug";
import { orderStatusColor } from "../../utils/orderStatus";
import { useAdminOrderDetail } from "../../hooks/useOrders";
import type { OrderItem } from "../../types/order";

/** Props for the admin order detail drawer. */
export interface OrderDetailDrawerProps {
  /** Order id to load; detail query is disabled when null. */
  orderId: number | null;
  /** Drawer visibility. */
  open: boolean;
  /** Closes the drawer. */
  onClose: () => void;
}

/**
 * Admin order detail drawer with customer info, item lines and totals.
 * @param props drawer props
 * @returns order detail drawer element
 */
export const OrderDetailDrawer = ({
  orderId,
  open,
  onClose,
}: OrderDetailDrawerProps) => {
  const { data: order, isLoading, isError, error } = useAdminOrderDetail(orderId);

  const itemColumns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (name: string | undefined, record: OrderItem) =>
        name ?? `#${record.productId}`,
    },
    {
      title: "Variants",
      dataIndex: "variantNames",
      key: "variantNames",
      render: (names: string[] | undefined) =>
        names && names.length > 0 ? names.join(", ") : "-",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 70,
      render: (qty: number) => qty ?? "-",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (price: number) => formatPrice(price ?? 0),
    },
  ];

  return (
    <Drawer
      title={order ? `Order ${order.orderNumber}` : "Order detail"}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : isError || !order ? (
        <Alert
          type="error"
          showIcon
          message="Failed to load order detail."
          description={
            isError ? getApiErrorMessage(error, "Please try again.") : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Tag color={orderStatusColor(order.status)}>
              {order.status.toUpperCase()}
            </Tag>
          </div>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Order number">
              {order.orderNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Customer">
              {order.customer}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{order.email}</Descriptions.Item>
            <Descriptions.Item label="Address">
              {order.address}
            </Descriptions.Item>
            <Descriptions.Item label="Payment">
              {order.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {new Date(order.createdAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
          <Table<OrderItem>
            columns={itemColumns}
            dataSource={order.items}
            rowKey={(_record, index) => String(index)}
            pagination={false}
            size="small"
            locale={{ emptyText: "No items in this order." }}
          />
          <div className="text-right text-base font-medium text-zinc-900">
            Total: {formatPrice(order.totalAmount ?? 0)}
          </div>
        </div>
      )}
    </Drawer>
  );
};
