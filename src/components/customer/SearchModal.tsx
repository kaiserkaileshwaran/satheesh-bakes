import React, { useState } from 'react';
import { Search, X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/avatarGenerator';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const products = StorageService.getProducts();

  const filtered = searchTerm.trim() === ''
    ? products.slice(0, 4)
    : products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.metadata.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const POPULAR_SEARCHES = ['Chocolate Truffle', 'Hot Veg Puff', 'Chicken Puff', 'Sourdough', 'Red Velvet', 'Eggless'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-white dark:bg-bakery-chocolate w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-bakery-beige">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-bakery-beige dark:border-bakery-brown/30 flex items-center gap-3">
          <Search className="w-5 h-5 text-bakery-brown dark:text-bakery-gold shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cakes, spicy puffs, cookies, sourdough..."
            className="flex-1 text-sm bg-transparent text-bakery-chocolate dark:text-bakery-cream outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-bakery-beige/60 text-bakery-chocolate dark:text-bakery-cream"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Popular Searches */}
          {searchTerm.trim() === '' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-bakery-brown/70 dark:text-bakery-gold uppercase tracking-wider">
                Trending Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-bakery-beige/50 dark:bg-bakery-brown/30 text-bakery-chocolate dark:text-bakery-cream hover:bg-bakery-gold/20 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Results */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 uppercase tracking-wider">
              {searchTerm ? `Search Results (${filtered.length})` : 'Popular Items'}
            </h4>

            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-bakery-chocolate/60">
                No bakery items matching "{searchTerm}". Try another keyword.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onClose();
                      if (onSelectProduct) onSelectProduct(product);
                      else navigate('/menu');
                    }}
                    className="p-3 rounded-2xl bg-bakery-cream/40 dark:bg-bakery-brown/20 border border-bakery-beige/70 hover:border-bakery-gold/60 flex items-center gap-3 cursor-pointer hover:shadow-xs transition-all"
                  >
                    <img
                      src={product.coverImage}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-serif font-bold text-xs text-bakery-chocolate dark:text-bakery-cream truncate">
                        {product.name}
                      </h5>
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                      <p className="text-xs text-bakery-brown font-bold mt-1">
                        {formatCurrency(product.offerPrice || product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
