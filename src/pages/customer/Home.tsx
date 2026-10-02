import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Star, 
  ChevronRight,
  MapPin, 
  Phone,
  Store
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { ProductCard } from '../../components/customer/ProductCard';
import { useDataSync } from '../../hooks/useDataSync';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const cms = useDataSync(() => StorageService.getCMS());
  const products = useDataSync(() => StorageService.getProducts());
  const categories = useDataSync(() => StorageService.getCategories());
  const branches = useDataSync(() => StorageService.getBranches());
  const offers = useDataSync(() => StorageService.getOffers());
  const allReviews = useDataSync(() => StorageService.getReviews());

  const bestSellers = products.filter((p) => p.bestSeller);
  
  // Hero Carousel
  const banners = cms.banners?.filter(b => b.enabled).sort((a, b) => a.displayOrder - b.displayOrder) || [];
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Review Carousel – pull from real approved reviews
  const approvedReviews = allReviews.filter((r) => r.status === 'approved');
  const TESTIMONIALS = approvedReviews.length > 0
    ? approvedReviews.map((r) => ({
        name: r.customerName,
        location: r.productName || 'Satheesh Bakery',
        comment: r.comment,
        rating: r.rating,
        avatar: r.avatarText,
        bg: r.avatarBg,
      }))
    : [
        { name: 'Ananya Ramesh', location: 'Namakkal', comment: 'The Belgian Chocolate Truffle cake was absolute perfection for my daughter\'s birthday! Premium quality and amazing taste.', rating: 5, avatar: 'AR', bg: '#6F4E37' },
        { name: 'Dr. Subramanian K.', location: 'Namakkal', comment: 'Best hot veg puffs in town! Perfectly flaky layers, hot spiced potatoes, and zero greasy residue.', rating: 5, avatar: 'SK', bg: '#D4A017' },
        { name: 'Priya Dharshini', location: 'Namakkal', comment: 'Their sourdough bread and almond butter cookies are unmatched. A truly artisanal experience.', rating: 5, avatar: 'PD', bg: '#3E2723' },
      ];

  const [currentReview, setCurrentReview] = useState(0);
  const [isReviewPaused, setIsReviewPaused] = useState(false);

  useEffect(() => {
    if (isReviewPaused) return;
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isReviewPaused, TESTIMONIALS.length]);

  // Branch Carousel
  const [branchIndex, setBranchIndex] = useState(0);
  
  useEffect(() => {
    if (branches.length <= 1) return;
    const interval = setInterval(() => {
      setBranchIndex((prev) => (prev + 1) % branches.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [branches.length]);

  const visibleBranches = branches.length > 0 
    ? [
        branches[branchIndex],
        branches[(branchIndex + 1) % branches.length],
        branches[(branchIndex + 2) % branches.length]
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full h-[85vh] min-h-[600px] flex items-center">
        {banners.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
            >
              <img
                src={banners[currentBanner].desktopImage}
                alt={banners[currentBanner].title}
                className="w-full h-full object-cover hidden md:block"
              />
              <img
                src={banners[currentBanner].mobileImage}
                alt={banners[currentBanner].title}
                className="w-full h-full object-cover md:hidden"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-bakery-chocolate z-0" />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bakery-gold/20 backdrop-blur-md text-bakery-gold font-bold text-xs border border-bakery-gold/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Daily • Premium Digital Menu</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentBanner}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                <h1 className="font-serif font-bold text-5xl md:text-6xl text-white leading-tight">
                  {banners[currentBanner]?.title || 'Artisanal Bakes'}
                </h1>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed font-normal">
                  {banners[currentBanner]?.subtitle || 'Experience the magic of freshly baked premium pastries.'}
                </p>
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    to={banners[currentBanner]?.buttonLink || '/menu'}
                    className="px-8 py-4 rounded-2xl bg-bakery-gold hover:bg-white text-bakery-chocolate font-bold text-base shadow-warm hover:shadow-warm-lg hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <span>{banners[currentBanner]?.buttonText || 'View Menu'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/franchise"
                    className="px-8 py-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 hover:bg-white/10 text-white font-bold text-base hover:scale-105 transition-all"
                  >
                    Partner With Us
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                className={`transition-all rounded-full ${
                  currentBanner === idx ? 'w-8 h-2.5 bg-bakery-gold' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-bakery-beige/30 to-bakery-beige/10 dark:from-bakery-brown/20 dark:to-transparent border border-bakery-gold/20 p-8 sm:p-16 lg:p-24 text-center max-w-5xl mx-auto backdrop-blur-sm"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-bakery-gold to-transparent opacity-50" />
          
          <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-bakery-gold/10 text-bakery-gold mb-2 shadow-sm">
               <Store className="w-8 h-8" />
            </div>

            <div className="space-y-4 max-w-3xl">
              <span className="text-sm font-bold text-bakery-gold uppercase tracking-[0.2em]">The Satheesh Legacy</span>
              <h2 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-bakery-chocolate dark:text-bakery-cream leading-tight">
                Crafting Joy Through <br className="hidden sm:block" /><span className="italic text-bakery-brown dark:text-bakery-gold">Artisanal Baking</span>
              </h2>
            </div>
            
            <div className="w-16 h-0.5 bg-bakery-gold/50 mx-auto" />
            
            <div className="space-y-6 text-lg sm:text-xl text-bakery-chocolate/80 dark:text-bakery-cream/80 leading-relaxed max-w-4xl mx-auto font-light">
              <p>
                What started as a humble single-oven bakery in Namakkal has blossomed into Tamil Nadu's most beloved artisanal baking destination. Satheesh Bakery has been the cornerstone of countless celebrations, morning routines, and family gatherings.
              </p>
              <p>
                Our philosophy is simple: uncompromising quality, traditional techniques, and the finest ingredients. Every loaf of bread, every pastry, and every cake is handcrafted daily by our master bakers with the same passion and dedication as our very first day.
              </p>
            </div>
            
            <div className="pt-8">
              <Link
                to="/menu"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-bakery-chocolate dark:bg-bakery-cream text-white dark:text-bakery-chocolate font-bold text-sm sm:text-base hover:scale-105 hover:shadow-xl transition-all"
              >
                <span>Taste the Tradition</span> 
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-bakery-gold/10 rounded-full blur-[100px] pointer-events-none" />
        </motion.div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-bakery-gold uppercase tracking-wider">Explore Catalogue</span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-bakery-chocolate dark:text-bakery-cream">
              Browse Categories
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-bakery-brown hover:text-bakery-gold flex items-center gap-1 transition-colors"
          >
            <span>View All</span> <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/menu?cat=${cat.id}`)}
              className="p-5 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige/80 hover:border-bakery-gold/60 shadow-xs hover:shadow-warm transition-all duration-300 flex flex-col items-center text-center cursor-pointer group hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-bakery-beige/50 dark:bg-bakery-brown/30 text-3xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                {cat.icon}
              </div>
              <h3 className="font-serif font-bold text-sm text-bakery-chocolate dark:text-bakery-cream group-hover:text-bakery-brown">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Customer Favorites
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-bakery-chocolate dark:text-bakery-cream">
              Best Sellers This Week
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-bakery-brown hover:text-bakery-gold flex items-center gap-1 transition-colors"
          >
            <span>View Full Menu</span> <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Active Festive Offers Section */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-bakery-chocolate via-bakery-brown to-bakery-chocolate text-bakery-cream relative overflow-hidden shadow-warm-lg">
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="px-3 py-1 rounded-full bg-bakery-gold text-bakery-chocolate font-bold text-xs uppercase tracking-wider inline-block">
                Limited Time Promotions
              </span>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-bakery-cream">
                {offers[0].title}
              </h2>
              <p className="text-sm text-bakery-cream/80 leading-relaxed">
                {offers[0].description}
              </p>
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-bakery-gold text-bakery-chocolate font-bold text-sm hover:bg-bakery-gold-light transition-all shadow-md"
              >
                <span>Claim Offer Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Branch Locator Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-bakery-gold uppercase tracking-wider">Explore our Locations</span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-bakery-chocolate dark:text-bakery-cream">
            Our Branches
          </h2>
        </div>

        <div className="flex gap-6 relative justify-center">
          <AnimatePresence mode="popLayout">
            {visibleBranches.map((b) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.8 }}
                className="w-full sm:w-[400px] shrink-0 p-6 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige/80 shadow-xs hover:shadow-warm transition-shadow space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-bakery-chocolate dark:text-bakery-cream">
                      {b.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.isOpen === false 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {b.isOpen === false ? '🔴 Closed' : '🟢 Open'}
                    </span>
                  </div>
                  <p className="text-sm text-bakery-chocolate/70 dark:text-bakery-cream/70 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-bakery-gold shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </p>
                  <p className="text-sm text-bakery-chocolate/70 dark:text-bakery-cream/70 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-bakery-gold shrink-0" />
                    <span>{b.phone}</span>
                  </p>
                </div>
                <a
                  href={b.googleMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-bakery-beige/50 dark:bg-bakery-brown/20 hover:bg-bakery-gold/20 text-bakery-chocolate dark:text-bakery-cream font-bold text-sm text-center transition-colors block mt-4"
                >
                  View on Google Maps
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Customer Testimonials Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Verified Customer Feedback</span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-bakery-chocolate dark:text-bakery-cream">
            What Bakery Lovers Say
          </h2>
        </div>

        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsReviewPaused(true)}
          onMouseLeave={() => setIsReviewPaused(false)}
        >
          <div className="h-[250px] sm:h-[200px] flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReview}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-full absolute p-8 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige/80 shadow-md space-y-6 flex flex-col justify-between text-center"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    {[...Array(TESTIMONIALS[currentReview].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-base sm:text-lg text-bakery-chocolate/80 dark:text-bakery-cream/80 italic leading-relaxed max-w-2xl mx-auto">
                    "{TESTIMONIALS[currentReview].comment}"
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
                    style={{ backgroundColor: TESTIMONIALS[currentReview].bg }}
                  >
                    {TESTIMONIALS[currentReview].avatar}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-bakery-chocolate dark:text-bakery-cream">
                      {TESTIMONIALS[currentReview].name}
                    </h4>
                    <p className="text-xs text-bakery-chocolate/50">
                      {TESTIMONIALS[currentReview].location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center mt-6 gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentReview(idx)}
                className={`transition-all rounded-full ${
                  currentReview === idx ? 'w-6 h-2 bg-bakery-brown' : 'w-2 h-2 bg-bakery-beige hover:bg-bakery-brown/50'
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
