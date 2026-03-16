// @ts-nocheck
import { Row, Col, Card, Statistic, Table } from 'antd';
import { ShoppingOutlined, UserOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';
import { orders } from '../../data/orders';
import { products } from '../../data/products';
import { formatPrice } from '../../utils/formatPrice';

export const AdminDashboard = () => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  const recentOrdersColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
          status === 'processing' ? 'bg-blue-100 text-blue-800' :
          'bg-zinc-100 text-zinc-800'
        }`}>
          {status.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-zinc-800">Dashboard Overview</h2>
      
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              formatter={(value) => formatPrice(Number(value))}
              valueStyle={{ color: '#18181b', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Orders"
              value={totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#18181b', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Active Products"
              value={totalProducts}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#18181b', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Conversion Rate"
              value={3.4}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#10b981', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-zinc-800">Recent Orders</h3>
        <Table 
          dataSource={orders} 
          columns={recentOrdersColumns} 
          rowKey="id"
          pagination={false}
        />
      </div>
    </div>
  );
};

// Need to import AppstoreOutlined
import { AppstoreOutlined } from '@ant-design/icons';
