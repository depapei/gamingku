import { AdminCategoryForm } from "@/src/components/admin/AdminCategoryForm";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  useCategories,
} from "@/src/hooks/useCategories";
import { Category } from "@/src/types/category";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message, Modal, Popconfirm, Space, Table } from "antd";
import { useState } from "react";

export const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();

  // create hooks
  const {
    mutate: create,
    isPending: createLoading,
    isSuccess,
  } = createCategory();

  // update hooks
  const {
    mutate: update,
    isPending: uPending,
    isSuccess: uSuccess,
  } = updateCategory();

  // delete hooks
  const {
    mutate: del,
    isPending: dPending,
    isSuccess: dSuccess,
  } = deleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Category>({});

  const handleCreate = (data: any) => {
    // console.log("Create category:", data);
    create(data);
    if (isSuccess) {
      message.success("Category created successfully");
      setIsModalOpen(false);
    }
  };

  const handleUpdate = (data: Category) => {
    update(data);
    if (uSuccess) {
      message.success(`Category ${data.name} updated successfully`);
      setUpdateModalOpen(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    del(id);
    if (dSuccess) {
      message.success(`Category ${name} deleted successfully`);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <img
          src={image || "https://via.placeholder.com/150"}
          alt="category"
          className="w-12 h-12 object-cover rounded"
          referrerPolicy="no-referrer"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      sorter: (a: Category, b: Category) => a.slug.localeCompare(b.slug),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              const init = {
                ...record,
                createdBy: 172,
              };
              setSelectedData(init);
              setUpdateModalOpen(true);
            }}
            className="text-blue-600"
          />
          <Popconfirm
            title="Delete the category"
            description="Are you sure to delete this category?"
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-zinc-800 m-0">Categories</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-zinc-900"
          onClick={() => setIsModalOpen(true)}
        >
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="Add New Category"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <AdminCategoryForm onSubmit={handleCreate} />
      </Modal>
      <Modal
        title={`Edit ${selectedData.name}`}
        open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <AdminCategoryForm initialData={selectedData} onSubmit={handleUpdate} />
      </Modal>
    </div>
  );
};
