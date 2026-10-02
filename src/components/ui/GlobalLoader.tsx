import React from 'react';

export const GlobalLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-bakery-surface/80 dark:bg-gray-950/80 backdrop-blur-md flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-6">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-4 border-bakery-beige/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-bakery-gold rounded-full border-t-transparent animate-spin"></div>
        
        {/* Inner static bread/croissant icon */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">
          🥐
        </div>
      </div>
      
      <h3 className="font-serif font-bold text-xl text-bakery-chocolate dark:text-bakery-cream tracking-wide">
        Satheesh <span className="text-bakery-gold italic">Bakery</span>
      </h3>
      <p className="text-xs text-bakery-chocolate/60 dark:text-bakery-cream/60 tracking-[0.2em] uppercase mt-2 font-bold animate-pulse">
        Baking Freshness...
      </p>
    </div>
  );
};
