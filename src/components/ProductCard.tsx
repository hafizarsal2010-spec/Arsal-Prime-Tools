import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, ShieldCheck, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, viewProductDetails, setActiveView } = useStore();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => viewProductDetails(product.id)}
      className="group relative bg-[#13161e] rounded-2xl border border-white/[0.08] hover:border-red-500/40 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-950/20 hover:-translate-y-1 cursor-pointer"
    >
      {/* Visual Showcase Header */}
      <div className="relative aspect-[4/3] w-full bg-[#171b26] p-4 flex items-center justify-center overflow-hidden border-b border-white/[0.06]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to styled SVG box if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Subtle In Stock marker */}
        <div className="absolute top-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-emerald-700/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Instant Dispatch</span>
        </div>

        {/* Featured Tag */}
        {product.featured && (
          <div className="absolute top-3 right-3 text-[11px] font-bold text-red-300 bg-red-950/90 backdrop-blur-md px-2 py-0.5 rounded border border-red-700/40">
            Top Seller
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category and duration unboxed metadata with separators */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-red-400 font-semibold uppercase tracking-wider text-[11px]">
              {product.category}
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="truncate">{product.duration}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 font-['Syne',sans-serif]">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Trust Specs: Rating & Warranty */}
          <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400">
            <div className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
              <span className="text-zinc-500 font-normal">({product.reviewsCount})</span>
            </div>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <div className="flex items-center gap-1 text-zinc-300 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="truncate text-[11px]">{product.warranty}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA Controls */}
        <div className="pt-3 border-t border-white/[0.06] space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs text-zinc-500 font-medium">Price in PKR</div>
              <div className="text-lg font-extrabold text-white font-mono tabular-nums tracking-tight">
                Rs. {product.price.toLocaleString()}
              </div>
            </div>
            {product.originalPrice > product.price && (
              <div className="text-right">
                <div className="text-xs text-zinc-500 line-through font-mono tabular-nums">
                  Rs. {product.originalPrice.toLocaleString()}
                </div>
                <div className="text-[11px] font-bold text-emerald-400">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleAddToCart}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white text-xs font-bold transition-all border border-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-red-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
