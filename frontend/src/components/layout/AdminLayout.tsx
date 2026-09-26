import { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, message, Button, Tag } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  TagsOutlined,
  FileTextOutlined,
  UserOutlined,
  ShopOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/src/store/authStore";
import { authLogout, useBootSession } from "@/src/hooks/useAuth";

const { Header, Sider, Content } = Layout;

const SECTION_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/users": "Users",
};

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isFetching: isBooting } = useBootSession();
  const logoutMutation = authLogout();

  const admin =
    isAuthenticated && (user?.role === "admin" || user?.role === "superadmin");

  useEffect(() => {
    if (!isBooting && !admin) {
      navigate("/");
      message.error("Please login as admin first!");
    }
  }, [admin, isBooting, navigate]);

  const pathname = useMemo(
    () => location.pathname.replace(/\/$/, "") || "/admin",
    [location.pathname],
  );
  const sectionTitle = SECTION_TITLES[pathname] ?? "Admin";
  const initial = (user?.name ?? user?.email ?? "A").charAt(0).toUpperCase();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      handleLogout();
      return;
    }
    navigate(key);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/"),
    });
  };

  if (isBooting) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">
        Loading admin…
      </div>
    );
  }

  if (!admin) return null;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={232}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={64}
        style={{ borderRight: "1px solid #E4E4E7" }}
      >
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #E4E4E7",
            padding: "0 16px",
          }}
        >
          <Link
            to="/admin"
            className="text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontSize: collapsed ? 14 : 17,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
            aria-label="Gamingku admin dashboard"
          >
            {collapsed ? "G" : "GAMINGKU ADMIN"}
          </Link>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          onClick={handleMenuClick}
          style={{ borderRight: 0, padding: "12px 8px" }}
          items={[
            {
              key: "/admin",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "/admin/products",
              icon: <ShoppingOutlined />,
              label: "Products",
            },
            {
              key: "/admin/categories",
              icon: <TagsOutlined />,
              label: "Categories",
            },
            {
              key: "/admin/orders",
              icon: <FileTextOutlined />,
              label: "Orders",
            },
            {
              key: "/admin/users",
              icon: <UserOutlined />,
              label: "Users",
            },
            {
              type: "divider",
            },
            {
              key: "/",
              icon: <ShopOutlined />,
              label: "Back to store",
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Log out",
              danger: true,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E4E4E7",
            padding: "0 24px",
            height: 56,
            lineHeight: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#18181B",
              margin: 0,
            }}
          >
            {sectionTitle}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#3F3F46" }}>
              {user?.name ?? user?.email ?? "Admin"}
            </span>
            {user?.role && (
              <Tag style={{ margin: 0, textTransform: "capitalize" }}>
                {user.role}
              </Tag>
            )}
            <div
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#E4E4E7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#52525B",
              }}
            >
              {initial}
            </div>
            <Button
              size="small"
              icon={<LogoutOutlined />}
              loading={logoutMutation.isPending}
              onClick={handleLogout}
              aria-label="Log out of admin"
            >
              Log out
            </Button>
          </div>
        </Header>
        <Content
          style={{
            padding: 24,
            background: "#FAFAFA",
            overflow: "auto",
          }}
        >
          <div>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
