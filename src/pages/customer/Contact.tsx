import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { useDataSync } from '../../hooks/useDataSync';

export const Contact: React.FC = () => {
  const branches = useDataSync(() => StorageService.getBranches());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-bakery-gold uppercase tracking-wider">We'd Love to Hear From You</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-bakery-chocolate dark:text-bakery-cream">Contact Satheesh Bakery</h1>
        <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70">Reach out to any of our branches or drop us a message and our team will respond promptly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="p-6 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-xs space-y-3 relative">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif font-bold text-lg text-bakery-chocolate dark:text-bakery-cream">{branch.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                branch.isOpen === false 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {branch.isOpen === false ? '🔴 Closed' : '🟢 Open'}
              </span>
            </div>
            <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70 flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-bakery-gold shrink-0 mt-0.5" />
              {branch.address}
            </p>
            <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-bakery-gold shrink-0" />
              {branch.phone}
            </p>
            <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-bakery-gold shrink-0" />
              {branch.openingHours} – {branch.closingHours}
            </p>
            <a
              href={branch.mapEmbedUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-bakery-brown dark:text-bakery-gold font-bold text-xs underline underline-offset-2"
            >
              View on Google Maps →
            </a>
          </div>
        ))}
      </div>

    </div>
  );
};
