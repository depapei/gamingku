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
  AdminProductForm,
  type ProductFormValues,
} from "../../../components/admin/AdminProductForm";
import { useCategories } from "../../../hooks/useCategories";
import {
  useAdminProductDetail,
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "../../../hooks/useProducts";
import type {
  AdminProduct,
  CreateProductInput,
  UpdateProductInput,
} from "../../../types/product";
import { formatPrice } from "../../../utils/formatPrice";
import { getApiErrorMessage } from "../../../utils/slug";

/** Fallback image for products without an image URL. */
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200";

/**
 * Maps validated form values to a create payload, dropping empty rows.
 * @param values validated form values
 * @returns create payload for the admin API
 */
const toCreateInput = (values: ProductFormValues): CreateProductInput => ({
  name: values.name.trim(),
  slug: values.slug.trim(),
  price: Number(values.price),
  discountPrice: values.discountPrice != null ? Number(values.discountPrice) : undefined,
  stock: Number(values.stock),
  categoryId: Number(values.categoryId),
  images: (values.images ?? []).map((u) => u.trim()).filter(Boolean),
  description: values.description.trim(),
  featured: !!values.featured,
  variants: (values.variants ?? [])
    .map((v) => ({
      name: v.name.trim(),
      options: (v.options ?? [])
        .map((o) => ({ name: o.name.trim(), isAvailable: !!o.isAvailable }))
        .filter((o) => o.name),
    }))
    .filter((v) => v.name && v.options.length > 0),
  specifications: (values.specifications ?? [])
    .map((s) => ({ key: s.key.trim(), name: s.name.trim() }))
    .filter((s) => s.key && s.name),
});

/**
 * Maps validated form values to an update payload for the given slug.
 * @param slug route slug (source of truth)
 * @param values validated form values
 * @returns update payload for the admin API
 */
const toUpdateInput = (slug: string, values: ProductFormValues): UpdateProductInput => ({
  ...toCreateInput(values),
  slug,
});

/**
 * Admin product management page with server-driven search, sort and pagination.
 * @returns admin products page element
 */
export const AdminProducts = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState<{ sortBy?: string; sort?: string }>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | undefined>(undefined);
  const [detailSlug, setDetailSlug] = useState<string | undefined>(undefined);

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
  } = useAdminProducts({
    search,
    sortBy: sorter.sortBy,
    sort: sorter.sort,
    page: pagination.current,
    limit: pagination.pageSize,
  });

  const { data: categories } = useCategories();
  const { data: editDetail } = useAdminProductDetail(editingSlug);
  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useAdminProductDetail(detailSlug);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = useMemo(() => list?.data ?? [], [list]);
  const total = list?.total ?? 0;

  const handleCreate = (values: ProductFormValues) => {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (res) => {
        message.success(res.message || "Product created successfully");
        setIsCreateOpen(false);
      },
      onError: (err) => {
        message.error(getApiErrorMessage(err, "Failed to create product"));
      },
    });
  };

  const handleUpdate = (values: ProductFormValues) => {
    if (!editingSlug) return;
    updateMutation.mutate(
      { slug: editingSlug, payload: toUpdateInput(editingSlug, values) },
      {
        onSuccess: (res) => {
          message.success(res.message || "Product updated successfully");
          setEditingSlug(undefined);
        },
        onError: (err) => {
          message.error(getApiErrorMessage(err, "Failed to update product"));
        },
      },
    );
  };

  const handleDelete = (slug: string) => {
    deleteMutation.mutate(slug, {
      onSuccess: (res) => {
        message.success(res.message || `Product ${slug} deleted successfully`);
      },
      onError: (err) => {
        message.error(getApiErrorMessage(err, "Failed to delete product"));
      },
    });
  };

  const handleTableChange = (
    nextPagination: TablePaginationConfig,
    _filters: unknown,
    nextSorter: SorterResult<AdminProduct> | SorterResult<AdminProduct>[],
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
      title: "Image",
      dataIndex: "images",
      key: "image",
      width: 90,
      render: (images: string[], record: AdminProduct) => (
        <img
          src={images?.[0] || FALLBACK_IMAGE}
          alt={record.name ?? "product"}
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
      sortOrder: sortOrderFor("name"),
      render: (name: string) => name ?? "-",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string | undefined) => category ?? "-",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: true,
      sortOrder: sortOrderFor("price"),
      render: (price: number, record: AdminProduct) => (
        <div>
          {record.discountPrice ? (
            <>
              <span className="text-red-500 font-medium">
                {formatPrice(record.discountPrice)}
              </span>
              <br />
              <span className="text-zinc-400 line-through text-xs">
                {formatPrice(price ?? 0)}
              </span>
            </>
          ) : (
            <span>{formatPrice(price ?? 0)}</span>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: true,
      sortOrder: sortOrderFor("stock"),
      render: (stock: number) => (
        <Tag color={(stock ?? 0) > 10 ? "green" : (stock ?? 0) > 0 ? "orange" : "red"}>
          {stock ?? 0}
        </Tag>
      ),
    },
    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      render: (featured: boolean) => (
        <Tag color={featured ? "blue" : "default"}>{featured ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: unknown, record: AdminProduct) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            aria-label={`View ${record.name}`}
            onClick={() => setDetailSlug(record.slug)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={`Edit ${record.name}`}
            className="text-blue-600"
            onClick={() => setEditingSlug(record.slug)}
          />
          <Popconfirm
            title="Delete the product"
            description="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record.slug)}
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

  const wizardMode = editingSlug !== undefined ? "edit" : "create";
  const wizardOpen = isCreateOpen || editingSlug !== undefined;

  /** Closes the unified create/edit wizard. */
  const closeWizard = () => {
    setIsCreateOpen(false);
    setEditingSlug(undefined);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-2xl font-semibold text-zinc-800 m-0">Products</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input.Search
            placeholder="Search products"
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
            Add Product
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message="Failed to load products"
          description={getApiErrorMessage(error, "Please try again.")}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <Table<AdminProduct>
          columns={columns}
          dataSource={products}
          rowKey="slug"
          loading={isLoading || isFetching}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `${value} products`,
          }}
          onChange={handleTableChange}
          locale={{ emptyText: "No products found." }}
        />
      </div>

      <Modal
        title={wizardMode === "edit" ? `Edit ${editingSlug ?? ""}` : "Add New Product"}
        open={wizardOpen}
        onCancel={closeWizard}
        footer={null}
        destroyOnClose
        width={880}
      >
        {(!editingSlug || editDetail || wizardMode === "create") && (
          <AdminProductForm
            mode={wizardMode}
            initialData={editingSlug ? editDetail : null}
            categories={categories ?? []}
            submitting={
              editingSlug ? updateMutation.isPending : createMutation.isPending
            }
            onSubmit={editingSlug ? handleUpdate : handleCreate}
          />
        )}
      </Modal>

      <Modal
        title={detail?.name ?? "Product detail"}
        open={detailSlug !== undefined}
        onCancel={() => setDetailSlug(undefined)}
        footer={null}
        destroyOnClose
        width={720}
      >
        {isDetailLoading ? (
          <div className="py-8 text-center text-zinc-500">Loading detail…</div>
        ) : isDetailError || !detail ? (
          <Alert type="error" showIcon message="Failed to load product detail." />
        ) : (
          <div className="flex flex-col gap-3">
            <img
              src={detail.images?.[0] || FALLBACK_IMAGE}
              alt={detail.name}
              className="w-full h-44 object-cover rounded"
              referrerPolicy="no-referrer"
            />
            <div className="text-sm text-zinc-600">
              <span className="font-medium text-zinc-900">Price:</span>{" "}
              {formatPrice(detail.discountPrice || detail.price)}
              {detail.discountPrice ? (
                <span className="ml-2 text-zinc-400 line-through">
                  {formatPrice(detail.price)}
                </span>
              ) : null}
            </div>
            <div className="text-sm text-zinc-600">
              <span className="font-medium text-zinc-900">Stock:</span> {detail.stock}
              {" · "}
              <span className="font-medium text-zinc-900">Category:</span>{" "}
              {detail.category ?? `#${detail.categoryId}`}
            </div>
            <p className="text-sm text-zinc-600">{detail.description}</p>
            {(detail.specifications?.length ?? 0) > 0 && (
              <div>
                <div className="text-sm font-medium text-zinc-900 mb-1">
                  Specifications ({detail.specifications?.length})
                </div>
                {detail.specifications?.map((s) => (
                  <div key={s.key} className="text-sm text-zinc-600">
                    <span className="font-medium">{s.key}:</span> {s.name}
                  </div>
                ))}
              </div>
            )}
            {(detail.variants?.length ?? 0) > 0 && (
              <div>
                <div className="text-sm font-medium text-zinc-900 mb-1">
                  Variants ({detail.variants?.length})
                </div>
                {detail.variants?.map((v) => (
                  <div key={v.name} className="text-sm text-zinc-600">
                    <span className="font-medium">{v.name}:</span>{" "}
                    {v.options.map((o) => o.name).join(", ")}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
