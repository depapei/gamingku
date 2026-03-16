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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
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

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
