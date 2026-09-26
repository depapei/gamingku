import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
  type TablePaginationConfig,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { OrderDetailDrawer } from "../../../components/admin/OrderDetailDrawer";
import { OrderStatusModal } from "../../../components/admin/OrderStatusModal";
import {
  useAdminOrders,
  useDeleteOrder,
  useUpdateOrderStatus,
} from "../../../hooks/useOrders";
import { useOrderStore } from "../../../store/orderStore";
import type { Order, OrderStatus } from "../../../types/order";
import { formatPrice } from "../../../utils/formatPrice";
import { getApiErrorMessage } from "../../../utils/slug";
import { orderStatusColor } from "../../../utils/orderStatus";

const { RangePicker } = DatePicker;

/** Status filter options for the admin orders table. */
const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

/**
 * Admin order management page with server-driven search, filter, sort and pagination.
 * @returns admin orders page element
 */
export const AdminOrders = () => {
  const [searchInput, setSearchInput] = useState("");
  const [sorter, setSorter] = useState<{ sortBy?: string; sort?: string }>({});

  const filters = useOrderStore((s) => s.filters);
  const pagination = useOrderStore((s) => s.pagination);
  const selectedId = useOrderStore((s) => s.selectedId);
  const isDetailOpen = useOrderStore((s) => s.isDetailOpen);
  const isStatusOpen = useOrderStore((s) => s.isStatusOpen);
  const setFilters = useOrderStore((s) => s.setFilters);
  const setPagination = useOrderStore((s) => s.setPagination);
  const openDetail = useOrderStore((s) => s.openDetail);
  const closeDetail = useOrderStore((s) => s.closeDetail);
  const openStatus = useOrderStore((s) => s.openStatus);
  const closeStatus = useOrderStore((s) => s.closeStatus);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchInput.trim() ? searchInput.trim() : undefined });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const {
    data: list,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminOrders({
    search: filters.search,
    status: filters.status,
    dateFrom: filters.dateRange?.[0],
    dateTo: filters.dateRange?.[1],
    sortBy: sorter.sortBy,
    sort: sorter.sort as "asc" | "desc" | undefined,
    page: pagination.current,
    limit: pagination.pageSize,
  });

  const statusMutation = useUpdateOrderStatus();
  const deleteMutation = useDeleteOrder();

  const orders = useMemo(() => list?.data ?? [], [list]);
  const total = list?.total ?? 0;
  const statusOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

  const handleStatusSubmit = (status: OrderStatus) => {
    if (selectedId === null) return;
    statusMutation.mutate(
      { id: selectedId, status },
      {
        onSuccess: (res) => {
          message.success(res.message || "Order status updated");
          closeStatus();
        },
        onError: (err) => {
          message.error(getApiErrorMessage(err, "Failed to update status"));
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: (res) => {
        message.success(res.message || "Order deleted successfully");
      },
      onError: (err) => {
        message.error(getApiErrorMessage(err, "Failed to delete order"));
      },
    });
  };

  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _filters: unknown,
    nextSorter: SorterResult<Order> | SorterResult<Order>[],
  ) => {
    setPagination({
      current: nextPagination.current ?? 1,
      pageSize: nextPagination.pageSize ?? 10,
    });
    const single = Array.isArray(nextSorter) ? nextSorter[0] : nextSorter;
    if (single?.order && single?.field) {
      setSorter({
        sortBy: String(single.field),
        sort: single.order === "descend" ? "desc" : "asc",
      });
    } else {
      setSorter({});
    }
  };

  const sortOrderFor = (field: string) =>
    sorter.sortBy === field
      ? sorter.sort === "desc"
        ? ("descend" as const)
        : ("ascend" as const)
      : undefined;

  const columns = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber: string) => orderNumber ?? "-",
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      sorter: true,
      sortOrder: sortOrderFor("customer"),
      render: (customer: string) => customer ?? "-",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      width: 80,
      render: (items: Order["items"]) => items?.length ?? 0,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: true,
      sortOrder: sortOrderFor("totalAmount"),
      render: (totalAmount: number) => formatPrice(totalAmount ?? 0),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortOrder: sortOrderFor("status"),
      render: (status: string) => (
        <Tag color={orderStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder: sortOrderFor("createdAt"),
      render: (createdAt: string) =>
        createdAt ? new Date(createdAt).toLocaleDateString() : "-",
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: unknown, record: Order) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            aria-label={`View ${record.orderNumber}`}
            onClick={() => openDetail(record.id)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={`Update status of ${record.orderNumber}`}
            className="text-blue-600"
            onClick={() => openStatus(record.id)}
          />
          <Popconfirm
            title="Delete the order"
            description="Are you sure to delete this order?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: deleteMutation.isPending }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${record.orderNumber}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-2xl font-semibold text-zinc-800 m-0">Orders</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input.Search
            placeholder="Search orders"
            allowClear
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(value) => {
              setFilters({ search: value.trim() ? value.trim() : undefined });
            }}
            className="sm:w-64"
          />
          <Select
            value={filters.status ?? ""}
            onChange={(value) =>
              setFilters({ status: value ? value : undefined })
            }
            options={statusOptions}
            className="sm:w-40"
          />
          <RangePicker
            allowEmpty={[true, true]}
            onChange={(_dates, dateStrings) => {
              const [from, to] = dateStrings as [string, string];
              setFilters({
                dateRange: from || to ? [from, to] : undefined,
              });
            }}
          />
        </div>
      </div>

      {isError && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message="Failed to load orders"
          description={getApiErrorMessage(error, "Please try again.")}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <Table<Order>
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading || isFetching}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `${value} orders`,
          }}
          onChange={handleTableChange}
          locale={{ emptyText: <Empty description="No orders found." /> }}
        />
      </div>

      <OrderDetailDrawer
        orderId={isDetailOpen ? selectedId : null}
        open={isDetailOpen}
        onClose={closeDetail}
      />

      <OrderStatusModal
        order={isStatusOpen ? statusOrder : null}
        open={isStatusOpen}
        confirming={statusMutation.isPending}
        onSubmit={handleStatusSubmit}
        onCancel={closeStatus}
      />
    </div>
  );
};
