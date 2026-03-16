import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { ProductCard } from '../../components/product/ProductCard';
import { Select, Drawer, Button } from 'antd';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

export const Products = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || undefined;

  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { data: categories } = useCategories();

  useEffect(() => {
    if (slug && categories) {
      const category = categories.find(c => c.slug === slug);
      if (category) {
        setCategoryFilter(category.id);
      }
    } else if (!slug) {
      setCategoryFilter(undefined);
    }
  }, [slug, categories]);

  const { data: products, isLoading } = useProducts({
    category: categoryFilter,
    search: searchQuery,
    sort: sortOption,
  });

  const navigate = useNavigate();

  const handleCategoryChange = (val: string) => {
    if (val === 'all') {
      navigate('/products');
    } else {
      const category = categories?.find(c => c.id === val);
      if (category) {
        navigate(`/category/${category.slug}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-zinc-900 mb-2 uppercase">
            {searchQuery ? `SEARCH: ${searchQuery}` : slug ? slug.replace('-', ' ') : 'ALL PRODUCTS'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {searchQuery ? `Showing results for "${searchQuery}"` : 'Discover our complete collection of premium gaming gear.'}
          </p>
        </div>
        
        <div className="mt-6 md:mt-0 flex items-center space-x-4">
          <button 
            className="md:hidden flex items-center space-x-2 text-sm font-medium text-zinc-700 border border-zinc-200 px-4 py-2"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-zinc-500 uppercase tracking-wider">Sort by</span>
            <Select
              defaultValue="newest"
              style={{ width: 160 }}
              onChange={setSortOption}
              bordered={false}
              className="border-b border-zinc-300 rounded-none"
              options={[
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'best-selling', label: 'Best Selling' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-6 flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
            </h3>
            
            <div className="mb-8">
              <h4 className="text-sm font-medium text-zinc-900 mb-4">Category</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => handleCategoryChange('all')}
                    className={`text-sm ${!categoryFilter ? 'text-zinc-900 font-medium' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories?.filter(c => !c.parentId).map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`text-sm ${categoryFilter === cat.id ? 'text-zinc-900 font-medium' : 'text-zinc-500 hover:text-zinc-900'}`}
                    >
                      {cat.name}
                    </button>
                    {/* Subcategories */}
                    <ul className="ml-4 mt-2 space-y-2 border-l border-zinc-200 pl-3">
                      {categories?.filter(sub => sub.parentId === cat.id).map(sub => (
                        <li key={sub.id}>
                          <button 
                            onClick={() => handleCategoryChange(sub.id)}
                            className={`text-sm ${categoryFilter === sub.id ? 'text-zinc-900 font-medium' : 'text-zinc-500 hover:text-zinc-900'}`}
                          >
                            {sub.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/5] bg-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-zinc-500">No products found matching your criteria.</p>
              <button 
                onClick={() => { setCategoryFilter(undefined); setSortOption('newest'); }}
                className="mt-4 text-sm font-medium text-zinc-900 underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
            >
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        title="FILTERS"
        placement="right"
        onClose={() => setIsMobileFiltersOpen(false)}
        open={isMobileFiltersOpen}
        width={300}
      >
        <div className="mb-8">
          <h4 className="text-sm font-medium text-zinc-900 mb-4">Sort By</h4>
          <Select
            value={sortOption}
            style={{ width: '100%' }}
            onChange={setSortOption}
            options={[
              { value: 'newest', label: 'Newest Arrivals' },
              { value: 'price-asc', label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'best-selling', label: 'Best Selling' },
            ]}
          />
        </div>
        
        <div className="mb-8">
          <h4 className="text-sm font-medium text-zinc-900 mb-4">Category</h4>
          <ul className="space-y-4">
            <li>
              <button 
                onClick={() => { handleCategoryChange('all'); setIsMobileFiltersOpen(false); }}
                className={`text-sm ${!categoryFilter ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}
              >
                All Categories
              </button>
            </li>
            {categories?.filter(c => !c.parentId).map((cat) => (
              <li key={cat.id}>
                <button 
                  onClick={() => { handleCategoryChange(cat.id); setIsMobileFiltersOpen(false); }}
                  className={`text-sm ${categoryFilter === cat.id ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}
                >
                  {cat.name}
                </button>
                {/* Subcategories */}
                <ul className="ml-4 mt-2 space-y-2 border-l border-zinc-200 pl-3">
                  {categories?.filter(sub => sub.parentId === cat.id).map(sub => (
                    <li key={sub.id}>
                      <button 
                        onClick={() => { handleCategoryChange(sub.id); setIsMobileFiltersOpen(false); }}
                        className={`text-sm ${categoryFilter === sub.id ? 'text-zinc-900 font-medium' : 'text-zinc-500 hover:text-zinc-900'}`}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </Drawer>
    </div>
  );
};
