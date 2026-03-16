import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useFeaturedProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { ProductCard } from "../components/product/ProductCard";

export const Home = () => {
  const { data: featuredProducts, isLoading: isLoadingFeatured } =
    useFeaturedProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-100">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=2000"
            alt="Gaming Setup"
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-6 leading-tight"
          >
            ELEVATE YOUR
            <br />
            GAMEPLAY
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-zinc-200 mb-10 max-w-2xl mx-auto font-light"
          >
            Discover premium gaming gear designed for ultimate performance and
            minimalist aesthetics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Link
              to="/products"
              className="inline-block bg-white text-zinc-900 px-10 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-zinc-100 transition-colors"
            >
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-semibold tracking-tighter text-zinc-900">
            SHOP BY CATEGORY
          </h2>
        </div>

        {isLoadingCategories ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories?.slice(0, 3).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden aspect-[4/5] bg-zinc-100"
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="block w-full h-full"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-2xl font-medium text-white tracking-tight">
                      {category.name}
                    </h3>
                    <span className="inline-flex items-center mt-2 text-sm text-white font-medium uppercase tracking-wider group-hover:underline underline-offset-4">
                      Shop Now
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-zinc-100">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-semibold tracking-tighter text-zinc-900">
            FEATURED GEAR
          </h2>
          <Link
            to="/products"
            className="text-sm font-medium text-zinc-900 hover:underline underline-offset-4 uppercase tracking-wider hidden sm:block"
          >
            View All
          </Link>
        </div>

        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-block border border-zinc-900 text-zinc-900 px-8 py-3 text-sm font-medium uppercase tracking-wider"
          >
            View All
          </Link>
        </div>
      </section>
    </div>
  );
};
