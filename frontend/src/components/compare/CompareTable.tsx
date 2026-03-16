import { Product } from '../../types/product';
import { CompareSpecRow } from './CompareSpecRow';
import { formatPrice } from '../../utils/formatPrice';

interface CompareTableProps {
  products: Product[];
}

export const CompareTable = ({ products }: CompareTableProps) => {
  const p1 = products[0];
  const p2 = products[1];

  // Collect all unique specification keys from both products
  const specKeys = new Set<string>();
  if (p1?.specifications) Object.keys(p1.specifications).forEach(k => specKeys.add(k));
  if (p2?.specifications) Object.keys(p2.specifications).forEach(k => specKeys.add(k));

  const specsArray = Array.from(specKeys).sort();

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold tracking-tighter text-zinc-900 mb-6 uppercase border-b border-zinc-900 pb-4">
        General Information
      </h2>
      
      <div className="mb-12">
        <CompareSpecRow 
          label="Category" 
          value1={p1?.categoryId} 
          value2={p2?.categoryId} 
        />
        <CompareSpecRow 
          label="Price" 
          value1={p1 ? formatPrice(p1.discountPrice || p1.price) : undefined} 
          value2={p2 ? formatPrice(p2.discountPrice || p2.price) : undefined} 
        />
        <CompareSpecRow 
          label="Rating" 
          value1={p1 ? `${p1.rating} / 5.0 (${p1.reviewCount} reviews)` : undefined} 
          value2={p2 ? `${p2.rating} / 5.0 (${p2.reviewCount} reviews)` : undefined} 
        />
        <CompareSpecRow 
          label="Stock" 
          value1={p1 ? `${p1.stock > 0 ? 'In Stock' : 'Out of Stock'}` : undefined} 
          value2={p2 ? `${p2.stock > 0 ? 'In Stock' : 'Out of Stock'}` : undefined} 
        />
        <CompareSpecRow 
          label="Description" 
          value1={p1?.description} 
          value2={p2?.description} 
        />
      </div>

      {specsArray.length > 0 && (
        <>
          <h2 className="text-xl font-bold tracking-tighter text-zinc-900 mb-6 uppercase border-b border-zinc-900 pb-4">
            Technical Specifications
          </h2>
          
          <div className="mb-12">
            {specsArray.map(key => (
              <CompareSpecRow 
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').trim()} // Convert camelCase to Title Case
                value1={p1?.specifications?.[key]} 
                value2={p2?.specifications?.[key]} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
