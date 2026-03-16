import { Product } from '../../types/product';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { Trash2 } from 'lucide-react';
import { useCompareStore } from '../../store/compareStore';
import { formatPrice } from '../../utils/formatPrice';

interface CompareHeaderProps {
  products: Product[];
}

export const CompareHeader = ({ products }: CompareHeaderProps) => {
  const removeProduct = useCompareStore((state) => state.removeProduct);

  return (
    <div className="grid grid-cols-3 gap-8 mb-12">
      <div className="col-span-1 flex flex-col justify-end pb-8">
        <h1 className="text-3xl font-bold tracking-tighter text-zinc-900 mb-4">PRODUCT COMPARISON</h1>
        <p className="text-zinc-500 text-sm">Compare features and specifications to find the perfect gear for your setup.</p>
      </div>
      
      {products.map((product) => (
        <div key={product.id} className="col-span-1 flex flex-col items-center relative group">
          <button 
            onClick={() => removeProduct(product.id)}
            className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <Link to={`/product/${product.slug}`} className="w-full aspect-square bg-zinc-100 mb-6 overflow-hidden">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </Link>
          
          <Link to={`/product/${product.slug}`} className="text-lg font-semibold text-zinc-900 text-center hover:underline mb-2">
            {product.name}
          </Link>
          
          <div className="text-xl font-medium text-zinc-900 mb-4">
            {formatPrice(product.discountPrice || product.price)}
          </div>
          
          <Link 
            to={`/product/${product.slug}`}
            className="w-full bg-zinc-900 text-white py-3 text-center text-sm font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
          >
            View Product
          </Link>
        </div>
      ))}
      
      {products.length < 2 && (
        <div className="col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 p-8 text-center h-full min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <span className="text-2xl text-zinc-400">+</span>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">Add a product</h3>
          <p className="text-sm text-zinc-500 mb-6">Select another product to compare features side by side.</p>
          <Link 
            to="/products"
            className="border border-zinc-900 text-zinc-900 px-6 py-2 text-sm font-medium uppercase tracking-wider hover:bg-zinc-50 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};
