import { Table, Button, Space, Popconfirm, message, Tag, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useProducts } from '../../../hooks/useProducts';
import { Product } from '../../../types/product';
import { AdminProductForm } from '../../../components/admin/AdminProductForm';
import { formatPrice } from '../../../utils/formatPrice';

export const AdminProducts = () => {
  const { data: products, isLoading } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    message.success(`Product ${id} deleted successfully`);
    // In a real app, call mutation to delete
  };

  const handleCreate = (data: any) => {
    console.log('Create product:', data);
    message.success('Product created successfully');
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'image',
      render: (images: string[]) => (
        <img src={images?.[0] || 'https://via.placeholder.com/150'} alt="product" className="w-12 h-12 object-cover rounded" referrerPolicy="no-referrer" />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: Product) => (
        <div>
          {record.discountPrice ? (
            <>
              <span className="text-red-500 font-medium">{formatPrice(record.discountPrice)}</span>
              <br />
              <span className="text-zinc-400 line-through text-xs">{formatPrice(price)}</span>
            </>
          ) : (
            <span>{formatPrice(price)}</span>
          )}
        </div>
      ),
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      ),
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured: boolean) => (
        <Tag color={featured ? 'blue' : 'default'}>{featured ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} className="text-blue-600" />
          <Popconfirm
            title="Delete the product"
            description="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record.id)}
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
        <h2 className="text-2xl font-semibold text-zinc-800 m-0">Products</h2>
        <Button type="primary" icon={<PlusOutlined />} className="bg-zinc-900" onClick={() => setIsModalOpen(true)}>
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table 
          columns={columns} 
          dataSource={products} 
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="Add New Product"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <AdminProductForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
};
