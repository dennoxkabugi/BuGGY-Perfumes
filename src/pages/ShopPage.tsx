import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Product, Category } from '@/types';
import { getProducts, getCategories, getBrands } from '@/services/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton, EmptyState } from '@/components/Loaders';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const PRICE_RANGES = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $150', min: 100, max: 150 },
  { label: 'Over $150', min: 150, max: 10000 },
];

const RATING_OPTIONS = [
  { value: 4, label: '4 stars & up' },
  { value: 3, label: '3 stars & up' },
  { value: 2, label: '2 stars & up' },
];

const PAGE_SIZE = 12;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const categorySlug = searchParams.get('category') ?? '';
  const searchQuery = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const categoryId = categories.find((c) => c.slug === categorySlug)?.id;
    getProducts({
      category: categoryId,
      search: searchQuery,
      sort,
      brand: selectedBrand || undefined,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      rating: minRating || undefined,
    })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categorySlug, searchQuery, sort, selectedBrand, priceRange, minRating, categories]);

  const filteredProducts = useMemo(() => products, [products]);
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    setSearchParams(params);
  };

  const selectCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setPriceRange(null);
    setMinRating(0);
    setSearchParams({});
  };

  const activeFilterCount =
    (selectedBrand ? 1 : 0) + (priceRange ? 1 : 0) + (minRating ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Categories</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => selectCategory('')}
            className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !categorySlug ? 'bg-amber-50 text-amber-700 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.slug)}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                categorySlug === cat.slug ? 'bg-amber-50 text-amber-700 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Price Range</h3>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setPriceRange(priceRange?.min === range.min ? null : { min: range.min, max: range.max })}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                priceRange?.min === range.min ? 'bg-amber-50 text-amber-700 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Brand</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedBrand('')}
            className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !selectedBrand ? 'bg-amber-50 text-amber-700 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                selectedBrand === brand ? 'bg-amber-50 text-amber-700 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Rating</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setMinRating(0)}
            className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !minRating ? 'bg-amber-50 text-amber-700 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All Ratings
          </button>
          {RATING_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setMinRating(minRating === r.value ? 0 : r.value)}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                minRating === r.value ? 'bg-amber-50 text-amber-700 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-neutral-600 hover:text-amber-700 transition-colors py-2 border-t border-neutral-200"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
          {categorySlug
            ? categories.find((c) => c.slug === categorySlug)?.name ?? 'Shop'
            : searchQuery
            ? `Results for "${searchQuery}"`
            : 'All Products'}
        </h1>
        <p className="text-sm text-neutral-500">
          {loading ? 'Loading...' : `${filteredProducts.length} products found`}
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-medium text-neutral-900 bg-white px-4 py-2.5 rounded-xl border border-neutral-200"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="flex-1 lg:flex-none" />
            <select
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
              className="bg-white text-sm font-medium text-neutral-900 px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : paginatedProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters or search terms to find what you are looking for."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPage(i + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        page === i + 1
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
          </motion.div>
        </div>
      )}
    </div>
  );
}
