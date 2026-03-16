import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  AppstoreOutlined, 
  UserOutlined, 
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export const AdminLayout = () => {
  const location = useLocation();

  return (
    <Layout className="min-h-screen">
      <Sider width={250} theme="light" className="border-r border-zinc-200">
        <div className="h-16 flex items-center justify-center border-b border-zinc-200">
          <Link to="/" className="text-xl font-bold tracking-tighter text-zinc-900">
            GAMINGKU ADMIN
          </Link>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          className="border-r-0 pt-4"
          items={[
            {
              key: '/admin',
              icon: <DashboardOutlined />,
              label: <Link to="/admin">Dashboard</Link>,
            },
            {
              key: '/admin/products',
              icon: <ShoppingOutlined />,
              label: <Link to="/admin/products">Products</Link>,
            },
            {
              key: '/admin/categories',
              icon: <AppstoreOutlined />,
              label: 'Categories',
            },
            {
              key: '/admin/orders',
              icon: <ShoppingOutlined />,
              label: 'Orders',
            },
            {
              key: '/admin/users',
              icon: <UserOutlined />,
              label: 'Users',
            },
            {
              type: 'divider',
            },
            {
              key: '/admin/settings',
              icon: <SettingOutlined />,
              label: 'Settings',
            },
            {
              key: '/',
              icon: <LogoutOutlined />,
              label: <Link to="/">Back to Store</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white border-b border-zinc-200 px-6 flex items-center justify-between">
          <h1 className="text-lg font-medium text-zinc-800 m-0">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">Admin User</span>
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-medium">
              A
            </div>
          </div>
        </Header>
        <Content className="p-6 bg-zinc-50 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
