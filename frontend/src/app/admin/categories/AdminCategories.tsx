import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Modal,
  Popconfirm,
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
  PlusOutlined,
} from "@ant-design/icons";
import {
  AdminCategoryForm,
  type CategoryFormValues,
} from "@/src/components/admin/AdminCategoryForm";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  useAdminCategories,
  useCategoryDetail,
} from "@/src/hooks/useCategories";
import type { Category } from "@/src/types/category";
import { getApiErrorMessage, getApiErrorStatus } from "@/src/utils/slug";

/** Fallback image for categories without an image URL. */
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200";

/**
 * Admin category management page with server-driven search, sort and pagination.
 * @returns admin categories page element
 */
export const AdminCategories = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState<{ sortBy?: string; sort?: string }>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Category | null>(null);
  const [detailId, setDetailId] = useState<number | undefined>(undefined);
  const [formError, setFormError] = useState<{
    field: "slug";
    message: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim() ? searchInput.trim() : undefined);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: list,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminCategories({
    search,
    sortBy: sorter.sortBy,
    sort: sorter.sort,
    page: pagination.current,
    limit: pagination.pageSize,
  });

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useCategoryDetail(detailId);

  const createMutation = createCategory();
  const updateMutation = updateCategory();
  const deleteMutation = deleteCategory();

  const categories = useMemo(() => list?.data ?? [], [list]);
  const total = list?.total ?? 0;

  const parentNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  /**
   * Clears the category search filter and returns to the first page.
   */
  const resetFilters = () => {
    setSearchInput("");
    setSearch(undefined);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCreate = (values: CategoryFormValues) => {
    createMutation.mutate(
      {
        name: values.name,
        slug: values.slug,
        image: values.image,
        parentId: values.parentId ?? null,
      },
      {
        onSuccess: (res) => {
          message.success(res.message || "Category created successfully");
          setFormError(null);
          setIsCreateOpen(false);
        },
        onError: (err) => {
          if (getApiErrorStatus(err) === 409) {
            setFormError({
              field: "slug",
              message: getApiErrorMessage(err, "This slug is already in use"),
            });
          } else {
            message.error(getApiErrorMessage(err, "Failed to create category"));
          }
        },
      },
    );
  };

  const handleUpdate = (values: CategoryFormValues) => {
    if (!selectedData) return;
    updateMutation.mutate(
      {
        id: selectedData.id,
        payload: {
          id: selectedData.id,
          name: values.name,
          slug: values.slug,
          image: values.image,
          parentId: values.parentId ?? null,
        },
      },
      {
        onSuccess: (res) => {
          message.success(
            res.message || `Category ${values.name} updated successfully`,
          );
          setFormError(null);
          setIsEditOpen(false);
          setSelectedData(null);
        },
        onError: (err) => {
          if (getApiErrorStatus(err) === 409) {
            setFormError({
              field: "slug",
              message: getApiErrorMessage(err, "This slug is already in use"),
            });
          } else {
            message.error(getApiErrorMessage(err, "Failed to update category"));
          }
        },
      },
    );
  };

  const handleDelete = (id: number, name: string) => {
    deleteMutation.mutate(id, {
      onSuccess: (res) => {
        message.success(res.message || `Category ${name} deleted successfully`);
      },
      onError: (err) => {
        message.error(getApiErrorMessage(err, "Failed to delete category"));
      },
    });
  };

  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _filters: unknown,
    nextSorter: SorterResult<Category> | SorterResult<Category>[],
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

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 90,
      render: (image: string, record: Category) => (
        <img
          src={image || FALLBACK_IMAGE}
          alt={record.name}
          className="w-12 h-12 object-cover rounded"
          referrerPolicy="no-referrer"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        sorter.sortBy === "name"
          ? sorter.sort === "desc"
            ? ("descend" as const)
            : ("ascend" as const)
          : undefined,
      render: (name: string) => name ?? "-",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      sorter: true,
      sortOrder:
        sorter.sortBy === "slug"
          ? sorter.sort === "desc"
            ? ("descend" as const)
            : ("ascend" as const)
          : undefined,
      render: (slug: string) => slug ?? "-",
    },
    {
      title: "Parent",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId: number | null | undefined) => {
        if (parentId == null) return <Tag>Top-level</Tag>;
        return parentNameById.get(parentId) ?? `#${parentId}`;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: unknown, record: Category) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            aria-label={`View ${record.name}`}
            onClick={() => setDetailId(record.id)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={`Edit ${record.name}`}
            className="text-blue-600"
            onClick={() => {
              setSelectedData(record);
              setIsEditOpen(true);
            }}
          />
          <Popconfirm
            title="Delete the category"
            description="Are you sure to delete this category?"
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ loading: deleteMutation.isPending }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${record.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-2xl font-semibold text-zinc-800 m-0">Categories</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input.Search
            placeholder="Search categories"
            allowClear
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(value) => {
              setSearch(value.trim() ? value.trim() : undefined);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
            className="sm:w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-zinc-900"
            onClick={() => setIsCreateOpen(true)}
          >
            Add Category
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message="Failed to load categories"
          description={getApiErrorMessage(error, "Please try again.")}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <Table<Category>
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading || isFetching}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `${value} categories`,
          }}
          onChange={handleTableChange}
          locale={{ emptyText: "No categories found." }}
        />
      </div>

      {search !== undefined && (
        <div className="mt-3">
          <Button size="small" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>
      )}

      <Modal
        title="Add New Category"
        open={isCreateOpen}
        onCancel={() => {
          setIsCreateOpen(false);
          setFormError(null);
        }}
        footer={null}
        destroyOnClose
      >
        <AdminCategoryForm
          categories={categories}
          submitting={createMutation.isPending}
          formError={formError}
          onSubmit={handleCreate}
        />
      </Modal>

      <Modal
        title={`Edit ${selectedData?.name ?? ""}`}
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedData(null);
          setFormError(null);
        }}
        footer={null}
        destroyOnClose
      >
        {selectedData && (
          <AdminCategoryForm
            initialData={selectedData}
            categories={categories}
            excludeId={selectedData.id}
            submitting={updateMutation.isPending}
            formError={formError}
            onSubmit={handleUpdate}
          />
        )}
      </Modal>

      <Modal
        title={detail?.name ?? "Category detail"}
        open={detailId !== undefined}
        onCancel={() => setDetailId(undefined)}
        footer={null}
        destroyOnClose
      >
        {isDetailLoading ? (
          <div className="py-8 text-center text-zinc-500">Loading detail…</div>
        ) : isDetailError || !detail ? (
          <Alert type="error" showIcon message="Failed to load category detail." />
        ) : (
          <div className="flex flex-col gap-3">
            <img
              src={detail.image || FALLBACK_IMAGE}
              alt={detail.name}
              className="w-full h-44 object-cover rounded"
              referrerPolicy="no-referrer"
            />
            <div className="text-sm text-zinc-600">
              <span className="font-medium text-zinc-900">Slug:</span>{" "}
              {detail.slug}
            </div>
            {detail.parentId != null && (
              <div className="text-sm text-zinc-600">
                <span className="font-medium text-zinc-900">Parent ID:</span>{" "}
                {detail.parentId}
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-zinc-900 mb-2">
                Children ({detail.childs?.length ?? 0})
              </div>
              {(detail.childs?.length ?? 0) === 0 ? (
                <div className="text-sm text-zinc-500">No child categories.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {detail.childs?.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-3 border border-zinc-100 rounded p-2"
                    >
                      <img
                        src={child.image || FALLBACK_IMAGE}
                        alt={child.name}
                        className="w-10 h-10 object-cover rounded"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-sm font-medium text-zinc-900">
                          {child.name}
                        </div>
                        <div className="text-xs text-zinc-500">{child.slug}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
