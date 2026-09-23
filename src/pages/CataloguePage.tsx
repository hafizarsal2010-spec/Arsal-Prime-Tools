import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const CataloguePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await api.getProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
          sort: selectedSort,
        });
        let list = res.products || [];
        if (inStockOnly) {
          list = list.filter((p) => p.stockStatus === 'in_stock');
        }
        setProducts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, searchQuery, selectedSort, inStockOnly]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSort('popular');
    setInStockOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-white/[0.08] pb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-red-400">
          Digital Subscriptions &amp; Licenses
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Syne',sans-serif]">
          Product Catalogue
        </h1>
        <p className="text-xs text-zinc-400 max-w-2xl">
          Browse our full selection of genuine accounts, API tools, SEO toolkits, and software memberships with instant delivery.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#13161f] p-4 rounded-2xl border border-white/[0.08]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tools (e.g. ChatGPT, Semrush, Canva, Claude)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/90 border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sorting & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* In-stock filter checkbox */}
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer bg-zinc-900/80 px-3 py-2 rounded-xl border border-white/[0.08] hover:border-white/[0.15]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-red-600 focus:ring-0 bg-zinc-800 border-white/[0.2]"
            />
            <span>Instant Dispatch Only</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-2 rounded-xl border border-white/[0.08]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="popular" className="bg-zinc-900 text-white">Most Popular</option>
              <option value="rating" className="bg-zinc-900 text-white">Highest Rated</option>
              <option value="newest" className="bg-zinc-900 text-white">Newest Additions</option>
              <option value="price-asc" className="bg-zinc-900 text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-zinc-900 text-white">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Functional Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory.toLowerCase() === cat.name.toLowerCase()
                ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid Results */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
          <span>Showing <strong>{products.length}</strong> available tools</span>
          {(searchQuery || selectedCategory !== 'all' || inStockOnly) && (
            <button
              onClick={handleResetFilters}
              className="text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-zinc-900/40 animate-pulse border border-white/[0.06]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#13161f] border border-white/[0.08] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No tools found matching your search</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Try searching for a different keyword or explore our full category list.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
            >
              Clear Filters &amp; View All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
