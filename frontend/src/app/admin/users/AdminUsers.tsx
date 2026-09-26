import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  message,
  type TablePaginationConfig,
} from "antd";
import type { SorterResult } from "antd/es/table/interface";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  AdminUserForm,
  type UserFormValues,
} from "@/src/components/admin/AdminUserForm";
import { AdminUserResetPasswordForm } from "@/src/components/admin/AdminUserResetPasswordForm";
import {
  useAdminUsers,
  useCreateUser,
  useDeleteUser,
  useResetUserPassword,
  useUpdateUser,
  useUpdateUserStatus,
  useUserDetail,
} from "@/src/hooks/useUsers";
import { useAdminUserStore } from "@/src/store/adminUserStore";
import { useAuthStore } from "@/src/store/authStore";
import type { User, UserRole } from "@/src/types/user";
import { getApiErrorMessage, getApiErrorStatus } from "@/src/utils/slug";

/** Tooltip message for actions blocked on the current user's own row. */
const SELF_BLOCK_MESSAGE = "You cannot modify your own account";

/**
 * Admin user management page with server-driven search, filter, sort and pagination.
 * @returns admin users page element
 */
export const AdminUsers = () => {
  const search = useAdminUserStore((s) => s.search);
  const role = useAdminUserStore((s) => s.role);
  const isActive = useAdminUserStore((s) => s.isActive);
  const page = useAdminUserStore((s) => s.page);
  const pageSize = useAdminUserStore((s) => s.pageSize);
  const sorter = useAdminUserStore((s) => s.sorter);
  const setSearch = useAdminUserStore((s) => s.setSearch);
  const setRole = useAdminUserStore((s) => s.setRole);
  const setIsActive = useAdminUserStore((s) => s.setIsActive);
  const setPage = useAdminUserStore((s) => s.setPage);
  const setPageSize = useAdminUserStore((s) => s.setPageSize);
  const setSorter = useAdminUserStore((s) => s.setSorter);
  const resetFilters = useAdminUserStore((s) => s.resetFilters);

  const currentUser = useAuthStore((s) => s.user);
  const callerRole = currentUser?.role ?? "";
  const callerEmail = (currentUser?.email ?? "").toLowerCase();

  const [searchInput, setSearchInput] = useState(search ?? "");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [detailId, setDetailId] = useState<number | undefined>(undefined);
  const [formError, setFormError] = useState<{
    field: "email";
    message: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim() ? searchInput.trim() : undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const {
    data: list,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminUsers({
    search,
    role,
    isActive,
    sortBy: sorter.sortBy,
    sort: sorter.sort,
    page,
    limit: pageSize,
  });

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useUserDetail(detailId);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const statusMutation = useUpdateUserStatus();
  const passwordMutation = useResetUserPassword();
  const deleteMutation = useDeleteUser();

  const users = useMemo(() => list?.data ?? [], [list]);
  const total = list?.total ?? 0;

  const allowedRoles: UserRole[] = useMemo(() => {
    if (callerRole === "superadmin") return ["superadmin", "admin", "customer"];
    return ["customer"];
  }, [callerRole]);

  const isSelfRow = (record: User) => {
    if (
      currentUser?.id !== undefined &&
      currentUser?.id !== null &&
      record.id !== undefined &&
      record.id !== null
    ) {
      return String(record.id) === String(currentUser.id);
    }
    return callerEmail !== "" && record.email.toLowerCase() === callerEmail;
  };

  const handleCreate = (values: UserFormValues) => {
    createMutation.mutate(
      {
        name: values.name?.trim() ?? "",
        email: values.email?.trim() ?? "",
        password: values.password ?? "",
        role: values.role ?? allowedRoles[0],
        isActive: values.isActive ?? true,
        avatar: values.avatar?.trim() ? values.avatar.trim() : undefined,
      },
      {
        onSuccess: (res) => {
          message.success(res.message || "User created successfully");
          setFormError(null);
          setIsCreateOpen(false);
        },
        onError: (err) => {
          if (getApiErrorStatus(err) === 409) {
            setFormError({
              field: "email",
              message: getApiErrorMessage(err, "This email is already in use"),
            });
          } else {
            message.error(getApiErrorMessage(err, "Failed to create user"));
          }
        },
      },
    );
  };

  const handleUpdate = (values: UserFormValues) => {
    if (!selectedData) return;
    updateMutation.mutate(
      {
        id: selectedData.id,
        payload: {
          id: selectedData.id,
          name: values.name?.trim() ?? selectedData.name,
          role: values.role ?? selectedData.role,
          avatar: values.avatar?.trim() ? values.avatar.trim() : undefined,
        },
      },
      {
        onSuccess: (res) => {
          message.success(res.message || "User updated successfully");
          setFormError(null);
          setSelectedData(null);
        },
        onError: (err) => {
          if (getApiErrorStatus(err) === 409) {
            setFormError({
              field: "email",
              message: getApiErrorMessage(err, "This email is already in use"),
            });
          } else {
            message.error(getApiErrorMessage(err, "Failed to update user"));
          }
        },
      },
    );
  };

  const handleStatusChange = (record: User, next: boolean) => {
    Modal.confirm({
      title: next ? "Activate user" : "Deactivate user",
      content: `Are you sure you want to ${next ? "activate" : "deactivate"} ${record.email}?`,
      okText: "Yes",
      cancelText: "No",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          statusMutation.mutate(
            { isActive: next, id: record.id },
            {
              onSuccess: (res) => {
                message.success(res.message || "User status updated");
                resolve();
              },
              onError: (err) => {
                message.error(
                  getApiErrorMessage(err, "Failed to update user status"),
                );
                reject(err);
              },
            },
          );
        }),
    });
  };

  const handlePasswordReset = (password: string) => {
    if (!resetTarget) return;
    passwordMutation.mutate(
      { password, id: resetTarget.id },
      {
        onSuccess: (res) => {
          message.success(res.message || "Password has been reset");
          setResetTarget(null);
        },
        onError: (err) => {
          message.error(getApiErrorMessage(err, "Failed to reset password"));
        },
      },
    );
  };

  const handleDelete = (record: User) => {
    deleteMutation.mutate(record.id, {
      onSuccess: (res) => {
        message.success(res.message || "User deleted successfully");
      },
      onError: (err) => {
        message.error(getApiErrorMessage(err, "Failed to delete user"));
      },
    });
  };

  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _filters: unknown,
    nextSorter: SorterResult<User> | SorterResult<User>[],
  ) => {
    const current = nextPagination.current ?? 1;
    const size = nextPagination.pageSize ?? pageSize;
    if (size !== pageSize) {
      setPageSize(size);
    } else if (current !== page) {
      setPage(current);
    }
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

  const sortOrderFor = (key: string) =>
    sorter.sortBy === key
      ? sorter.sort === "desc"
        ? ("descend" as const)
        : ("ascend" as const)
      : undefined;

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: sortOrderFor("name"),
      render: (name: string) => name ?? "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder: sortOrderFor("email"),
      render: (email: string) => email ?? "-",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      sorter: true,
      sortOrder: sortOrderFor("role"),
      render: (roleValue: UserRole) => {
        const color =
          roleValue === "superadmin"
            ? "red"
            : roleValue === "admin"
              ? "blue"
              : "default";
        return <Tag color={color}>{roleValue ?? "-"}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (value: boolean, record: User) => {
        const self = isSelfRow(record);
        return (
          <Space size="small">
            <Tooltip title={self ? SELF_BLOCK_MESSAGE : ""}>
              <span>
                <Switch
                  checked={!!value}
                  disabled={self || statusMutation.isPending}
                  onChange={(next) => handleStatusChange(record, next)}
                  aria-label={`Toggle status for ${record.email}`}
                />
              </span>
            </Tooltip>
            <Badge
              status={value ? "success" : "default"}
              text={value ? "Active" : "Inactive"}
            />
          </Space>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder: sortOrderFor("createdAt"),
      render: (value: string | undefined) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      title: "Action",
      key: "action",
      width: 190,
      render: (_: unknown, record: User) => {
        const self = isSelfRow(record);
        return (
          <Space size="middle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              aria-label={`View ${record.email}`}
              onClick={() => setDetailId(record.id)}
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${record.email}`}
              className="text-blue-600"
              onClick={() => setSelectedData(record)}
            />
            {!self && (
              <Button
                type="text"
                icon={<KeyOutlined />}
                aria-label={`Reset password for ${record.email}`}
                className="text-amber-600"
                onClick={() => setResetTarget(record)}
              />
            )}
            {self && (
              <Tooltip title={SELF_BLOCK_MESSAGE}>
                <span>
                  <Button
                    type="text"
                    icon={<KeyOutlined />}
                    aria-label={`Reset password for ${record.email}`}
                    disabled
                  />
                </span>
              </Tooltip>
            )}
            {!self && (
              <Popconfirm
                title="Delete the user"
                description="Are you sure to delete this user?"
                onConfirm={() => handleDelete(record)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ loading: deleteMutation.isPending }}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`Delete ${record.email}`}
                />
              </Popconfirm>
            )}
            {self && (
              <Tooltip title={SELF_BLOCK_MESSAGE}>
                <span>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${record.email}`}
                    disabled
                  />
                </span>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-2xl font-semibold text-zinc-800 m-0">Users</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input.Search
            placeholder="Search name or email"
            allowClear
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(value) => {
              setSearch(value.trim() ? value.trim() : undefined);
            }}
            className="sm:w-64"
          />
          <Select
            placeholder="Role"
            allowClear
            value={role}
            onChange={(value) => setRole(value as UserRole | undefined)}
            className="sm:w-36"
            options={[
              { label: "Superadmin", value: "superadmin" },
              { label: "Admin", value: "admin" },
              { label: "Customer", value: "customer" },
            ]}
          />
          <Select
            placeholder="Status"
            allowClear
            value={isActive === undefined ? undefined : String(isActive)}
            onChange={(value) =>
              setIsActive(
                value === undefined ? undefined : value === "true",
              )
            }
            className="sm:w-32"
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-zinc-900"
            onClick={() => setIsCreateOpen(true)}
          >
            Add User
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message="Failed to load users"
          description={getApiErrorMessage(error, "Please try again.")}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <Table<User>
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoading || isFetching}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `${value} users`,
          }}
          onChange={handleTableChange}
          locale={{ emptyText: "No users found." }}
        />
      </div>

      {(search || role !== undefined || isActive !== undefined) && (
        <div className="mt-3">
          <Button size="small" onClick={() => {
            resetFilters();
            setSearchInput("");
          }}>
            Reset filters
          </Button>
        </div>
      )}

      <Modal
        title="Add New User"
        open={isCreateOpen}
        onCancel={() => {
          setIsCreateOpen(false);
          setFormError(null);
        }}
        footer={null}
        destroyOnClose
      >
        <AdminUserForm
          mode="create"
          allowedRoles={allowedRoles}
          submitting={createMutation.isPending}
          formError={formError}
          onSubmit={handleCreate}
        />
      </Modal>

      <Modal
        title={`Edit ${selectedData?.email ?? ""}`}
        open={selectedData !== null}
        onCancel={() => {
          setSelectedData(null);
          setFormError(null);
        }}
        footer={null}
        destroyOnClose
      >
        {selectedData && (
          <AdminUserForm
            mode="edit"
            initialData={selectedData}
            allowedRoles={
              isSelfRow(selectedData) ? [selectedData.role] : allowedRoles
            }
            submitting={updateMutation.isPending}
            formError={formError}
            onSubmit={handleUpdate}
          />
        )}
      </Modal>

      <Modal
        title={`Reset password for ${resetTarget?.email ?? ""}`}
        open={resetTarget !== null}
        onCancel={() => setResetTarget(null)}
        footer={null}
        destroyOnClose
      >
        <AdminUserResetPasswordForm
          submitting={passwordMutation.isPending}
          onSubmit={handlePasswordReset}
        />
      </Modal>

      <Modal
        title={detail?.email ?? "User detail"}
        open={detailId !== undefined}
        onCancel={() => setDetailId(undefined)}
        footer={null}
        destroyOnClose
      >
        {isDetailLoading ? (
          <div className="py-8 text-center text-zinc-500">Loading detail…</div>
        ) : isDetailError || !detail ? (
          <Alert type="error" showIcon message="Failed to load user detail." />
        ) : (
          <div className="flex flex-col gap-2 text-sm text-zinc-600">
            <div>
              <span className="font-medium text-zinc-900">Name:</span>{" "}
              {detail.name}
            </div>
            <div>
              <span className="font-medium text-zinc-900">Email:</span>{" "}
              {detail.email}
            </div>
            <div>
              <span className="font-medium text-zinc-900">Role:</span>{" "}
              {detail.role}
            </div>
            <div>
              <span className="font-medium text-zinc-900">Status:</span>{" "}
              {detail.isActive ? "Active" : "Inactive"}
            </div>
            {detail.createdAt && (
              <div>
                <span className="font-medium text-zinc-900">Created:</span>{" "}
                {new Date(detail.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
