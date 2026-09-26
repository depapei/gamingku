import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Statistic,
  Table,
  Tag,
  type CardProps,
} from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import {
  DollarOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { FC } from "react";
import { useAdminDashboardSummary } from "@/src/hooks/useDashboard";
import type { RecentOrderItem } from "@/src/types/dashboard";
import { formatPrice } from "@/src/utils/formatPrice";
import { orderStatusColor } from "@/src/utils/orderStatus";

/**
 * Callable alias for AntD Card. The v6 types expose Card via an
 * interface-extends declaration that TS 5.8 cannot use as a JSX element;
 * the runtime component is unchanged.
 */
const DashboardCard: FC<CardProps> = Card as unknown as FC<CardProps>;

/** Canonical status order for the orders-by-status panel. */
const statusOrder = [
  "pending",
  "paid",
  "processing",
  "completed",
  "cancelled",
  "refunded",
] as const;

/**
 * Live admin dashboard overview: KPI cards, orders by status, recent orders,
 * low-stock list and management shortcuts bound to the summary endpoint.
 */
export const AdminDashboard = () => {
  const { data, isLoading, isError, refetch } = useAdminDashboardSummary();

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
        <Row gutter={[24, 24]}>
          {[0, 1, 2, 3].map((key) => (
            <Col key={key} xs={24} sm={12} lg={6}>
              <DashboardCard>
                <Skeleton active paragraph={{ rows: 1 }} />
              </DashboardCard>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
        <Alert
          type="error"
          message="Failed to load dashboard summary"
          description="The overview stats could not be loaded. Please try again."
          action={
            <Button size="small" danger onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const recentColumns: ColumnsType<RecentOrderItem> = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber: string) => (
        <Link to="/admin/orders" aria-label={`View orders (order ${orderNumber})`}>
          {orderNumber}
        </Link>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={orderStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      render: (totalPrice: number) => formatPrice(Number(totalPrice ?? 0)),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) =>
        createdAt ? new Date(createdAt).toLocaleDateString() : "-",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>

      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard>
            <Statistic
              title="Total Revenue"
              value={Number(data.revenue?.total ?? 0)}
              formatter={(value) => formatPrice(Number(value ?? 0))}
              prefix={<DollarOutlined />}
            />
          </DashboardCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard>
            <Statistic
              title="Total Orders"
              value={Number(data.counts?.orders ?? 0)}
              prefix={<FileTextOutlined />}
            />
          </DashboardCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard>
            <Statistic
              title="Active Products"
              value={Number(data.counts?.products ?? 0)}
              prefix={<ShoppingOutlined />}
            />
          </DashboardCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard>
            <Statistic
              title="Total Users"
              value={Number(data.counts?.users ?? 0)}
              prefix={<UserOutlined />}
            />
          </DashboardCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <DashboardCard title="Recent Orders">
            <Table<RecentOrderItem>
              dataSource={data.recentOrders ?? []}
              columns={recentColumns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: "No orders yet" }}
            />
            <div style={{ marginTop: 16 }}>
              <Link to="/admin/orders">View all orders</Link>
            </div>
          </DashboardCard>
        </Col>
        <Col xs={24} lg={8}>
          <DashboardCard title="Orders by Status" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {statusOrder.map((status) => (
                <Tag key={status} color={orderStatusColor(status)}>
                  {status}: {Number(data.ordersByStatus[status] ?? 0)}
                </Tag>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <span>
                Month revenue:{" "}
                {formatPrice(Number(data.revenue?.month ?? 0))}
              </span>
            </div>
          </DashboardCard>

          <DashboardCard title="Low Stock" style={{ marginBottom: 24 }}>
            {(data.lowStock ?? []).length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="All products are well stocked"
              />
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {(data.lowStock ?? []).map((item) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "8px 0",
                    }}
                  >
                    <span>
                      <Link
                        to="/admin/products"
                        aria-label={`Manage product ${item.name}`}
                      >
                        {item.name}
                      </Link>{" "}
                      <Tag color={item.stock <= 0 ? "red" : "orange"}>
                        {item.stock} left
                      </Tag>
                    </span>
                    <span>{formatPrice(Number(item.price ?? 0))}</span>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>

          <DashboardCard title="Shortcuts">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Link to="/admin/products">
                <Button block>Manage products</Button>
              </Link>
              <Link to="/admin/orders">
                <Button block>Manage orders</Button>
              </Link>
              <Link to="/admin/users">
                <Button block>Manage users</Button>
              </Link>
              <Link to="/admin/categories">
                <Button block>Manage categories</Button>
              </Link>
            </div>
          </DashboardCard>
        </Col>
      </Row>
    </div>
  );
};
