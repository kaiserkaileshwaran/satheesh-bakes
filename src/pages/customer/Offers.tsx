import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../../services/storageService';
import { useDataSync } from '../../hooks/useDataSync';

export const Offers: React.FC = () => {
  const offers = useDataSync(() => StorageService.getOffers());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-bakery-gold uppercase tracking-wider">Festive & Special Deals</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-bakery-chocolate dark:text-bakery-cream">
          Current Promotions & Offers
        </h1>
        <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70">
          Enjoy exclusive savings on celebration cakes, hot puff combos, and tea-time snacks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-3xl overflow-hidden bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-warm hover:shadow-warm-lg transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-16/9 bg-bakery-beige/30">
              <img
                src={offer.bannerUrl}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                {offer.discountPercentage}% OFF
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-bakery-chocolate dark:text-bakery-cream">
                  {offer.title}
                </h3>
                <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70 mt-1 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-bakery-beige/50">
                <span className="text-xs font-semibold text-bakery-brown/70 dark:text-bakery-gold">
                  Valid until: {offer.endDate}
                </span>
                <Link
                  to="/menu"
                  className="px-4 py-2 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-xs hover:bg-bakery-brown-dark transition-colors flex items-center gap-1"
                >
                  <span>Order Offer Items</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
