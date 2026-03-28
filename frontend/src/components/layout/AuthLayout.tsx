import { Layout } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export const AuthLayout = () => {
  const location = useLocation();

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="bg-zinc-50 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="min-h-screen grid md:grid-cols-2">
              {/* LEFT */}
              <div className="hidden md:flex items-center justify-center bg-zinc-900 text-white p-10">
                <div className="max-w-md">
                  <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
                  <p className="text-zinc-400">
                    Upgrade your gaming gear faster. Everything you need is on
                    Gamingku.
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl">
                  <h2 className="text-2xl font-semibold mb-6 text-zinc-800">
                    {location.pathname === "/auth" ? "Login" : "Register"}
                  </h2>
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
