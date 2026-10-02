import React, { useState } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../../services/storageService';

export const AnnouncementBar: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const cms = StorageService.getCMS();
  const ann = cms.announcement;

  if (dismissed || !ann || !ann.enabled) return null;

  return (
    <div className="bg-gradient-to-r from-bakery-chocolate via-bakery-brown to-bakery-chocolate text-bakery-cream px-4 py-2.5 shadow-md relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1 bg-bakery-gold/20 rounded-full shrink-0 animate-pulse text-bakery-gold">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <p className="truncate">
            <span className="font-semibold text-bakery-gold mr-1.5">{ann.title}</span>
            <span className="hidden md:inline opacity-90">{ann.description}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {ann.buttonText && ann.buttonLink && (
            <Link
              to={ann.buttonLink}
              className="inline-flex items-center gap-1 bg-bakery-gold hover:bg-bakery-gold-light text-bakery-chocolate font-bold px-3 py-1 rounded-full text-xs transition-colors shadow-sm"
            >
              <span>{ann.buttonText}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/10 rounded-full text-bakery-cream/70 hover:text-bakery-cream transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
