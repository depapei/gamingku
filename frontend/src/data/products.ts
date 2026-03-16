import { Product } from "../types/product";

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Pro Mechanical Keyboard X1",
    slug: "pro-mechanical-keyboard-x1",
    price: 1499000,
    discountPrice: 1299000,
    stock: 50,
    categoryId: "cat-1",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: 4.8,
    reviewCount: 124,
    description:
      "A premium mechanical keyboard with custom tactile switches, RGB backlighting, and an aluminum frame. Perfect for both gaming and typing.",
    variants: [
      {
        id: "v1",
        name: "Switch Type",
        options: ["Linear", "Tactile", "Clicky"],
      },
      { id: "v2", name: "Color", options: ["Black", "White"] },
    ],
    featured: true,
    specifications: {
      brand: "ProGear",
      connection: "Wired / Bluetooth 5.0",
      weight: "1.2 kg",
      size: "Full Size",
      switchType: "Tactile / Linear / Clicky",
    },
  },
  {
    id: "prod-2",
    name: "UltraLight Gaming Mouse V2",
    slug: "ultralight-gaming-mouse-v2",
    price: 899000,
    stock: 120,
    categoryId: "cat-2",
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1527814050087-379381547339?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: 4.9,
    reviewCount: 342,
    description:
      "Weighing only 55g, this wireless gaming mouse features a 26K DPI sensor for pixel-perfect tracking and 80 hours of battery life.",
    variants: [
      {
        id: "v1",
        name: "Color",
        options: ["Matte Black", "Glossy White", "Neon Pink"],
      },
    ],
    featured: true,
    specifications: {
      brand: "UltraPlay",
      connection: "Wireless 2.4GHz",
      weight: "55 g",
      dpi: "26000 DPI",
      size: "Medium",
    },
  },
  {
    id: "prod-3",
    name: 'Curved Ultrawide Monitor 34"',
    slug: "curved-ultrawide-monitor-34",
    price: 7999000,
    discountPrice: 6999000,
    stock: 15,
    categoryId: "cat-3",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: 4.7,
    reviewCount: 89,
    description:
      "Immerse yourself in your games with this 34-inch curved ultrawide monitor. Features 144Hz refresh rate, 1ms response time, and HDR400 support.",
    featured: true,
    specifications: {
      brand: "VisionTech",
      connection: "DisplayPort 1.4 / HDMI 2.1",
      weight: "7.5 kg",
      size: "34 inch",
      refreshRate: "144Hz",
      panelType: "IPS",
    },
  },
  {
    id: "prod-4",
    name: "Studio Quality Wireless Headset",
    slug: "studio-quality-wireless-headset",
    price: 1999000,
    stock: 45,
    categoryId: "cat-4",
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: 4.6,
    reviewCount: 210,
    description:
      "Experience crystal clear audio with our studio-quality drivers. Includes a detachable noise-canceling microphone and plush memory foam earcups.",
    variants: [
      { id: "v1", name: "Color", options: ["Carbon Black", "Arctic White"] },
    ],
    featured: false,
    specifications: {
      brand: "AudioPro",
      connection: "Wireless 2.4GHz / Bluetooth",
      weight: "280 g",
      batteryLife: "30 hours",
      driverSize: "50mm",
    },
  },
  {
    id: "prod-5",
    name: "Extended RGB Desk Mat",
    slug: "extended-rgb-desk-mat",
    price: 399000,
    stock: 200,
    categoryId: "cat-5",
    images: [
      "https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: 4.5,
    reviewCount: 56,
    description:
      "A massive 900x400mm desk mat with customizable RGB edge lighting. Features a micro-woven surface for precise mouse control.",
    featured: false,
    specifications: {
      brand: "DeskMaster",
      connection: "USB-C (for RGB)",
      weight: "800 g",
      size: "900 x 400 x 4 mm",
      material: "Micro-woven cloth",
    },
  },
  {
    id: "prod-6",
    name: "Compact 60% Mechanical Keyboard",
    slug: "compact-60-mechanical-keyboard",
    price: 1099000,
    stock: 80,
    categoryId: "cat-1",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1200",
    ],
    rating: 4.4,
    reviewCount: 112,
    description:
      "Save desk space without sacrificing performance. This 60% keyboard features hot-swappable switches and PBT keycaps.",
    variants: [
      { id: "v1", name: "Switch Type", options: ["Linear", "Tactile"] },
    ],
    featured: false,
    specifications: {
      brand: "ProGear",
      connection: "Wired USB-C",
      weight: "600 g",
      size: "60%",
      switchType: "Hot-swappable Linear / Tactile",
    },
  },
];
