/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { MainLayout } from "./components/layout/MainLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Home } from "./app/Home";
import { Products } from "./app/products/Products";
import { ProductDetail } from "./app/product/[slug]/ProductDetail";
import { Cart } from "./app/cart/Cart";
import { Compare } from "./app/compare/Compare";
import { AdminDashboard } from "./app/admin/AdminDashboard";
import { AdminProducts } from "./app/admin/products/AdminProducts";
import { About } from "./app/about/About";
import { Manual } from "./app/support/Manual";
import { Contact } from "./app/support/Contact";
import ScrollToTop from "./lib/ScrollToTop";
import { AdminCategories } from "./app/admin/categories/AdminCategories";
import { AuthLayout } from "./components/layout/AuthLayout";
import { Login } from "./app/auth/login";
import { Register } from "./app/auth/register";
import { useBootSession } from "./hooks/useAuth";

/**
 * Boot gate: rehydrates the session via the refresh cookie on app load.
 * NOTE: placed in App.tsx (not main.tsx) so useBootSession runs inside
 * the QueryClientProvider. Shows a splash only while the boot refresh is
 * in flight; logged-out users render routes immediately after.
 */
function BootGate() {
  const { isFetching } = useBootSession();
  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">
        Loading...
      </div>
    );
  }
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <BootGate />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="category/:slug" element={<Products />} />
            <Route path="search" element={<Products />} />
            <Route path="product/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="compare" element={<Compare />} />
            <Route path="about" element={<About />} />
            <Route path="support/manual" element={<Manual />} />
            <Route path="support/contact" element={<Contact />} />
          </Route>

          {/* Authentication Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
