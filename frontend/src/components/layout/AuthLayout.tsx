import { Layout } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const { Header, Sider, Content } = Layout;

export const AuthLayout = () => {
  const location = useLocation();

  return (
    <Layout className="min-h-screen">
      <Layout>
        <Content className="bg-zinc-50 overflow-auto">
          <div className="mx-auto">
            <div className="min-h-screen grid md:grid-cols-2 xl:grid-cols-3">
              {/* LEFT */}
              <div className="hidden xl:col-span-2 md:flex items-center justify-center relative p-10 text-white">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/assets/images/auth-bg.webp')",
                  }}
                />

                {/* Overlay biar gelap */}
                <div className="absolute inset-0 bg-zinc-900/70" />

                {/* Content */}
                <div className="relative max-w-md z-10">
                  <h2 className="p-2 bg-white w-fit text-xl font-semibold mb-3 text-zinc-800 rounded">
                    Gaming
                    <span className="bg-zinc-800 text-white px-1 mx-0.5">
                      Ku.
                    </span>
                  </h2>
                  <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
                  <p className="text-zinc-300">
                    Upgrade your gaming gear faster. Everything you need is on
                    Gamingku.
                  </p>
                </div>
              </div>
              {/* <div className="hidden xl:col-span-2 md:flex items-center justify-center bg-zinc-900 text-white p-10">
                <div className="max-w-md">
                  <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
                  <p className="text-zinc-400">
                    Upgrade your gaming gear faster. Everything you need is on
                    Gamingku.
                  </p>
                </div>
              </div> */}
              {/* RIGHT */}
              <div className="flex items-center justify-center px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-md bg-white p-8 rounded-2xl"
                >
                  <h2 className="text-2xl font-semibold mb-6 text-zinc-800">
                    {location.pathname === "/auth"
                      ? "Login"
                      : location.pathname === "/auth/register"
                        ? "Register"
                        : ""}
                  </h2>
                  <Outlet />
                </motion.div>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
