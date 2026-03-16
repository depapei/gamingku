import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, variant) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.selectedVariant === variant
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }

          return { items: [...state.items, { product, quantity, selectedVariant: variant }] };
        });
      },
      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.selectedVariant === variant)
          ),
        }));
      },
      updateQuantity: (productId, quantity, variant) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id === productId && item.selectedVariant === variant) {
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'gamingku-cart',
    }
  )
);
