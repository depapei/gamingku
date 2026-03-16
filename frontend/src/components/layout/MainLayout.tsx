import { Outlet, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, Scale } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useCompareStore } from "../../store/compareStore";
import { Badge, Dropdown, MenuProps, Popover } from "antd";
import React, { useState } from "react";
import { MegaMenu } from "./MegaMenu";

export const MainLayout = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { compareProducts } = useCompareStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const userMenu: MenuProps = {
    items: [
      { key: "1", label: <Link to="/admin">Admin Dashboard</Link> },
      { key: "2", label: "Logout" },
    ],
  };

  const mobileMenu: MenuProps = {
    items: [
      { key: "products", label: <Link to="/products">Products</Link> },
      { key: "about", label: <Link to="/about">About Us</Link> },
      {
        key: "support",
        label: "Support",
        children: [
          {
            key: "manual",
            label: <Link to="/support/manual">Manual Book</Link>,
          },
          {
            key: "contact",
            label: <Link to="/support/contact">Contact Us</Link>,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans">
      {/* Top Banner */}
      <div className="bg-zinc-900 text-white text-xs py-2 text-center tracking-wider uppercase">
        Free shipping on all orders over Rp. 250.000
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Dropdown
                menu={mobileMenu}
                trigger={["click"]}
                placement="bottomLeft"
              >
                <button className="p-2 text-zinc-600 hover:text-zinc-900">
                  <Menu className="w-6 h-6" />
                </button>
              </Dropdown>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-semibold tracking-tighter">
                GAMING
                <span className="bg-zinc-900 text-white px-1 ms-px">KU.</span>
              </Link>
            </div>

            <div className="flex justify-between gap-8">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8 items-center">
                <Popover
                  content={<MegaMenu />}
                  placement="bottomLeft"
                  trigger="hover"
                  overlayInnerStyle={{ padding: 0, borderRadius: "0.375rem" }}
                  arrow={false}
                >
                  <Link
                    to="/products"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors py-2"
                  >
                    PRODUCTS
                  </Link>
                </Popover>
                <Link
                  to="/about"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors py-2"
                >
                  ABOUT US
                </Link>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "manual",
                        label: <Link to="/support/manual">Manual Book</Link>,
                      },
                      {
                        key: "contact",
                        label: <Link to="/support/contact">Contact Us</Link>,
                      },
                    ],
                  }}
                  placement="bottomLeft"
                >
                  <span className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors py-2 cursor-pointer">
                    SUPPORT
                  </span>
                </Dropdown>
              </nav>

              {/* Right Icons */}
              <div className="flex items-center space-x-6">
                <form
                  onSubmit={handleSearch}
                  className="hidden md:flex items-center relative"
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 border-b border-zinc-300 py-1 pl-2 pr-8 text-sm focus:outline-none focus:border-zinc-900 bg-transparent transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 text-zinc-400 hover:text-zinc-900"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                <Dropdown menu={userMenu} placement="bottomRight">
                  <button className="text-zinc-600 hover:text-zinc-900 transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </Dropdown>

                <Link
                  to="/compare"
                  className="text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <Badge
                    count={compareProducts.length}
                    size="small"
                    color="#18181b"
                  >
                    <Scale className="w-5 h-5" />
                  </Badge>
                </Link>

                <Link
                  to="/cart"
                  className="text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <Badge count={totalItems} size="small" color="#18181b">
                    <ShoppingCart className="w-5 h-5" />
                  </Badge>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link
                to="/"
                className="text-2xl font-semibold tracking-tighter mb-4 inline-block"
              >
                GAMINGKU.
              </Link>
              <p className="text-zinc-500 text-sm max-w-md mt-4 leading-relaxed">
                Premium gaming gear for enthusiasts. We curate the best
                mechanical keyboards, ultra-lightweight mice, and
                high-refresh-rate monitors to elevate your setup.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">
                Shop
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/products"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/keyboards"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    Keyboards
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/mice"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    Mice
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/monitors"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    Monitors
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    Returns & Exchanges
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-zinc-400">
              &copy; {new Date().getFullYear()} GamingKu. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-zinc-400 hover:text-zinc-900 text-sm">
                Instagram
              </a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 text-sm">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
