import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useProductDetail } from '../../../hooks/useProducts';
import { useCartStore } from '../../../store/cartStore';
import { useCompareStore } from '../../../store/compareStore';
import { motion } from 'motion/react';
import { Star, ChevronRight, Minus, Plus, Scale } from 'lucide-react';
import { message } from 'antd';
import { formatPrice } from '../../../utils/formatPrice';

export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductDetail(slug || '');
  const addItem = useCartStore((state) => state.addItem);
  const { compareProducts, addProduct: addToCompare } = useCompareStore();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);

  const handleVariantChange = (variantId: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantId]: option }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if all variants are selected
    if (product.variants) {
      const missingVariants = product.variants.filter(v => !selectedVariants[v.id]);
      if (missingVariants.length > 0) {
        message.warning(`Please select ${missingVariants.map(v => v.name).join(', ')}`);
        return;
      }
    }

    const variantString = Object.values(selectedVariants).join(', ');
    addItem(product, quantity, variantString || undefined);
    message.success('Added to cart');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 aspect-square bg-zinc-100" />
          <div className="w-full md:w-1/2 space-y-6">
            <div className="h-8 bg-zinc-100 w-3/4" />
            <div className="h-6 bg-zinc-100 w-1/4" />
            <div className="h-24 bg-zinc-100 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
        <Link to="/products" className="text-zinc-500 hover:text-zinc-900 underline">
          Return to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-zinc-500 uppercase tracking-wider mb-8">
        <Link to="/" className="hover:text-zinc-900">Home</Link>
        <ChevronRight className="w-3 h-3 mx-2" />
        <Link to="/products" className="hover:text-zinc-900">Shop</Link>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square bg-zinc-100 mb-4 overflow-hidden"
          >
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 flex-shrink-0 bg-zinc-100 border-2 ${activeImage === idx ? 'border-zinc-900' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center text-zinc-900">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-zinc-300">|</span>
              <span className="text-sm text-zinc-500">{product.reviewCount} Reviews</span>
            </div>

            <div className="flex items-end space-x-3 mb-8">
              {product.discountPrice ? (
                <>
                  <span className="text-2xl font-medium text-zinc-900">{formatPrice(product.discountPrice)}</span>
                  <span className="text-lg text-zinc-500 line-through mb-0.5">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-2xl font-medium text-zinc-900">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-zinc-600 leading-relaxed mb-10">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants?.map((variant) => (
              <div key={variant.id} className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                  {variant.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleVariantChange(variant.id, option)}
                      className={`px-4 py-2 text-sm border transition-colors ${
                        selectedVariants[variant.id] === option
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 text-zinc-700 hover:border-zinc-900'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="h-px bg-zinc-200 w-full my-8" />

            {/* Actions */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-zinc-200 h-12">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-zinc-900 text-white h-12 text-sm font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-8">
              <button 
                onClick={() => addToCompare(product)}
                className="flex items-center justify-center space-x-2 flex-1 border border-zinc-900 text-zinc-900 h-12 text-sm font-semibold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Product</span>
              </button>
              
              {compareProducts.length === 2 && (
                <Link 
                  to="/compare"
                  className="flex items-center justify-center flex-1 bg-zinc-100 text-zinc-900 h-12 text-sm font-semibold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  View Comparison
                </Link>
              )}
            </div>

            <div className="text-sm text-zinc-500 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
