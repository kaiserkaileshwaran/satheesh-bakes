import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Flame, Candy, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/avatarGenerator';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const effectivePrice = product.offerPrice || product.price;
  const hasDiscount = product.offerPrice && product.offerPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100)
    : 0;

  return (
    <div
      onClick={() => navigate(`/menu/${product.id}`)}
      className="group relative bg-white dark:bg-bakery-chocolate rounded-3xl overflow-hidden border border-bakery-beige/70 hover:border-bakery-gold/60 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bakery-beige/30">
        <img
          src={product.coverImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-80" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {product.bestSeller && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Rating & Metadata */}
          <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-1">
            <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-bakery-brown/60 dark:text-bakery-cream/50 font-normal">({product.reviewCount})</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-bakery-brown/70 dark:text-bakery-gold/80">
              {product.metadata.spice > 0 && (
                <span className="flex items-center gap-0.5 text-rose-600">
                  <Flame className="w-3 h-3 fill-rose-500" /> Spice {product.metadata.spice}/5
                </span>
              )}
              {product.metadata.sweetness > 0 && (
                <span className="flex items-center gap-0.5 text-amber-600">
                  <Candy className="w-3 h-3" /> Sweet {product.metadata.sweetness}/5
                </span>
              )}
              {product.metadata.diet === 'eggless' && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px]">
                  🌱 Eggless
                </span>
              )}
            </div>
          </div>

          <h3 className="font-serif font-bold text-lg text-bakery-chocolate dark:text-bakery-cream group-hover:text-bakery-brown transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-bakery-beige/50 dark:border-bakery-brown/30 flex items-center justify-between">
          <div>
            <span className="font-serif font-bold text-xl text-bakery-brown dark:text-bakery-gold">
              {formatCurrency(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-bakery-chocolate/50 line-through ml-2">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-bakery-brown/70 dark:text-bakery-gold/70 group-hover:text-bakery-brown transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};
