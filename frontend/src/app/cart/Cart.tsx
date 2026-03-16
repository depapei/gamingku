import { useCartStore } from '../../store/cartStore';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../../utils/formatPrice';

export const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-zinc-900">Your cart is empty</h2>
        <p className="text-zinc-500 mb-8">Looks like you haven't added any gear to your cart yet.</p>
        <Link 
          to="/products" 
          className="inline-block bg-zinc-900 text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tighter text-zinc-900 mb-12">SHOPPING CART</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <div className="border-b border-zinc-200 pb-4 mb-6 hidden sm:grid grid-cols-12 gap-4 text-sm font-semibold text-zinc-900 uppercase tracking-wider">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <motion.div 
                key={`${item.product.id}-${item.selectedVariant}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center border-b border-zinc-100 pb-6"
              >
                <div className="col-span-6 flex items-center w-full">
                  <Link to={`/product/${item.product.slug}`} className="w-24 h-24 bg-zinc-100 flex-shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </Link>
                  <div className="ml-4 flex-grow">
                    <Link to={`/product/${item.product.slug}`} className="text-sm font-medium text-zinc-900 hover:underline">
                      {item.product.name}
                    </Link>
                    {item.selectedVariant && (
                      <p className="text-xs text-zinc-500 mt-1">{item.selectedVariant}</p>
                    )}
                    <p className="text-sm text-zinc-900 mt-2 sm:hidden">
                      {formatPrice(item.product.discountPrice || item.product.price)}
                    </p>
                  </div>
                </div>

                <div className="col-span-3 flex justify-center w-full sm:w-auto">
                  <div className="flex items-center border border-zinc-200 h-10 w-32">
                    <button 
                      onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.selectedVariant)}
                      className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1), item.selectedVariant)}
                      className="w-10 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="col-span-3 flex justify-between sm:justify-end items-center w-full sm:w-auto">
                  <span className="text-sm font-medium text-zinc-900 hidden sm:block">
                    {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                  </span>
                  <button 
                    onClick={() => removeItem(item.product.id, item.selectedVariant)}
                    className="text-zinc-400 hover:text-red-500 transition-colors sm:ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-zinc-50 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span>{getTotalPrice() > 1000000 ? 'Free' : formatPrice(50000)}</span>
              </div>
              <div className="border-t border-zinc-200 pt-4 flex justify-between font-semibold text-zinc-900 text-base">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice() + (getTotalPrice() > 1000000 ? 0 : 50000))}</span>
              </div>
            </div>

            <button className="w-full bg-zinc-900 text-white h-12 text-sm font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
