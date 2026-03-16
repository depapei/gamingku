import { Category } from "../types/category";

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Keyboards",
    slug: "keyboards",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "cat-1-1",
    name: "Mechanical Keyboard",
    slug: "mechanical-keyboard",
    parentId: "cat-1",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "cat-1-2",
    name: "Wireless Keyboard",
    slug: "wireless-keyboard",
    parentId: "cat-1",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "cat-1-3",
    name: "RGB Keyboard",
    slug: "rgb-keyboard",
    parentId: "cat-1",
  },
  {
    id: "cat-2",
    name: "Mice",
    slug: "mice",
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "cat-2-1",
    name: "Gaming Mouse",
    slug: "gaming-mouse",
    parentId: "cat-2",
  },
  {
    id: "cat-2-2",
    name: "Wireless Mouse",
    slug: "wireless-mouse",
    parentId: "cat-2",
  },
  {
    id: "cat-2-3",
    name: "Lightweight Mouse",
    slug: "lightweight-mouse",
    parentId: "cat-2",
  },
  {
    id: "cat-3",
    name: "Monitors",
    slug: "monitors",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "cat-3-1",
    name: "144Hz Monitor",
    slug: "144hz-monitor",
    parentId: "cat-3",
  },
  {
    id: "cat-3-2",
    name: "240Hz Monitor",
    slug: "240hz-monitor",
    parentId: "cat-3",
  },
  {
    id: "cat-3-3",
    name: "Ultrawide Monitor",
    slug: "ultrawide-monitor",
    parentId: "cat-3",
  },
  {
    id: "cat-4",
    name: "Headsets",
    slug: "headsets",
    image:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "cat-5",
    name: "Mousepads",
    slug: "mousepads",
    image:
      "https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&q=80&w=800",
  },
];
