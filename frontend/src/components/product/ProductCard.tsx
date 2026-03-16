import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import { motion } from 'motion/react';
import { formatPrice } from '../../utils/formatPrice';
import React from 'react';

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col"
    >
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-zinc-100 mb-4 block">
        <img
          src={product.images[0]}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {product.discountPrice && (
          <div className="absolute top-4 left-4 bg-zinc-900 text-white text-xs font-medium px-2 py-1 tracking-wider uppercase">
            Sale
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-medium px-2 py-1 tracking-wider uppercase">
            Sold Out
          </div>
        )}
      </Link>
      
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/product/${product.slug}`} className="text-sm font-medium text-zinc-900 hover:underline line-clamp-1">
            {product.name}
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 mt-auto pt-2">
          {product.discountPrice ? (
            <>
              <span className="text-sm font-medium text-zinc-900">{formatPrice(product.discountPrice)}</span>
              <span className="text-xs text-zinc-500 line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-sm font-medium text-zinc-900">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
