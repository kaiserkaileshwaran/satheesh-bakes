import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { useDataSync } from '../../hooks/useDataSync';
import { ProductCard } from '../../components/customer/ProductCard';

export const Menu: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';

  const products = useDataSync(() => StorageService.getProducts());
  const categories = useDataSync(() => StorageService.getCategories());

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [filterEgglessOnly, setFilterEgglessOnly] = useState(false);
  const [filterSpicyOnly, setFilterSpicyOnly] = useState(false);

  // Filtered & Sorted products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'published') return false;

      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesTag = p.metadata.tags.some((t) => t.toLowerCase().includes(q));
        const catName = categories.find(c => c.id === p.categoryId)?.name.toLowerCase() || '';
        const matchesCategory = catName.includes(q);
        
        if (!matchesName && !matchesDesc && !matchesTag && !matchesCategory) return false;
      }

      // Eggless filter
      if (filterEgglessOnly && p.metadata.diet !== 'eggless') {
        return false;
      }

      // Spicy filter
      if (filterSpicyOnly && p.metadata.spice < 2) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.offerPrice || a.price;
      const priceB = b.offerPrice || b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default 'popular': bestsellers first
      return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
    });
  }, [products, categories, selectedCategory, searchTerm, filterEgglessOnly, filterSpicyOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-bakery-gold uppercase tracking-wider">Freshly Baked Catalogue</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-bakery-chocolate dark:text-bakery-cream">
          Satheesh Bakery Digital Menu
        </h1>
        <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70">
          Browse celebration cakes, flaky spicy puffs, sourdough loaves, butter cookies, and hot rolls.
        </p>
      </div>

      {/* Category Tabs Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all shadow-xs ${
            selectedCategory === 'all'
              ? 'bg-bakery-brown text-bakery-cream'
              : 'bg-white dark:bg-bakery-chocolate border border-bakery-beige hover:border-bakery-gold text-bakery-chocolate dark:text-bakery-cream'
          }`}
        >
          All Items ({products.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-xs ${
              selectedCategory === cat.id
                ? 'bg-bakery-brown text-bakery-cream'
                : 'bg-white dark:bg-bakery-chocolate border border-bakery-beige hover:border-bakery-gold text-bakery-chocolate dark:text-bakery-cream'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-bakery-brown/60 dark:text-bakery-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items, ingredients, tags..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-bakery-beige/30 dark:bg-bakery-brown/20 border border-bakery-beige text-bakery-chocolate dark:text-bakery-cream outline-none focus:ring-2 focus:ring-bakery-gold font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-bakery-brown">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Eggless toggle */}
          <button
            onClick={() => setFilterEgglessOnly(!filterEgglessOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              filterEgglessOnly
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-bakery-chocolate border-bakery-beige text-bakery-chocolate dark:text-bakery-cream hover:border-emerald-600'
            }`}
          >
            🌱 Eggless Only
          </button>

          {/* Spicy toggle */}
          <button
            onClick={() => setFilterSpicyOnly(!filterSpicyOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              filterSpicyOnly
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white dark:bg-bakery-chocolate border-bakery-beige text-bakery-chocolate dark:text-bakery-cream hover:border-rose-600'
            }`}
          >
            🌶️ Hot Spicy
          </button>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'popular' | 'price-asc' | 'price-desc' | 'rating')}
            className="text-xs font-semibold p-2.5 rounded-xl bg-bakery-beige/30 dark:bg-bakery-brown/20 border border-bakery-beige text-bakery-chocolate dark:text-bakery-cream outline-none"
          >
            <option value="popular">Sort: Popular Bestsellers</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

        </div>
      </div>

      {/* Product Results */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-bakery-chocolate rounded-3xl border border-bakery-beige space-y-3">
          <div className="w-16 h-16 rounded-full bg-bakery-beige/50 text-bakery-brown flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <h3 className="font-serif font-bold text-lg text-bakery-chocolate dark:text-bakery-cream">
            No bakery items found
          </h3>
          <p className="text-xs text-bakery-chocolate/60 max-w-sm mx-auto">
            Try adjusting your search criteria or clearing filters to view available products.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
              setFilterEgglessOnly(false);
              setFilterSpicyOnly(false);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-xs shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};
