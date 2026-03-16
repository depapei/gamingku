import { useCompareStore } from '../../store/compareStore';
import { CompareHeader } from '../../components/compare/CompareHeader';
import { CompareTable } from '../../components/compare/CompareTable';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Compare = () => {
  const { compareProducts } = useCompareStore();

  if (compareProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-zinc-900">No products to compare</h2>
        <p className="text-zinc-500 mb-8">Add products to your comparison list to see them side by side.</p>
        <Link 
          to="/products" 
          className="inline-block bg-zinc-900 text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-zinc-500 uppercase tracking-wider mb-12">
        <Link to="/" className="hover:text-zinc-900">Home</Link>
        <ChevronRight className="w-3 h-3 mx-2" />
        <Link to="/products" className="hover:text-zinc-900">Shop</Link>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="text-zinc-900">Compare</span>
      </nav>

      <CompareHeader products={compareProducts} />
      <CompareTable products={compareProducts} />
    </div>
  );
};
