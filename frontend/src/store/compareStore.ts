import { create } from 'zustand';
import { Product } from '../types/product';
import { message } from 'antd';

interface CompareState {
  compareProducts: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  compareProducts: [],
  addProduct: (product: Product) => {
    const { compareProducts } = get();
    
    // Check if already in compare list
    if (compareProducts.some(p => p.id === product.id)) {
      message.info('Product is already in comparison list');
      return;
    }

    if (compareProducts.length >= 2) {
      message.warning('You can only compare up to 2 products at a time');
      return;
    }

    set({ compareProducts: [...compareProducts, product] });
    message.success('Added to comparison');
  },
  removeProduct: (productId: string) => {
    set((state) => ({
      compareProducts: state.compareProducts.filter((p) => p.id !== productId),
    }));
  },
  clearCompare: () => {
    set({ compareProducts: [] });
  },
}));
