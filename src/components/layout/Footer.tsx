import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Heart, Award, ShieldCheck } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { useDataSync } from '../../hooks/useDataSync';
import logoImg from '../../assets/logo.jpg';

export const Footer: React.FC = () => {
  useAuth();
  const branches = useDataSync(() => StorageService.getBranches());

  return (
    <footer className="bg-bakery-chocolate text-bakery-cream pt-16 pb-12 border-t border-bakery-brown/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Value Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-bakery-brown/40">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-bakery-gold/20 flex items-center justify-center text-bakery-gold shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-bakery-cream">Artisanal Quality</h4>
              <p className="text-xs text-bakery-cream/70 mt-0.5">Dutch cocoa, Belgian glazes, 100% cow ghee</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-bakery-gold/20 flex items-center justify-center text-bakery-gold shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-bakery-cream">Premium Quality</h4>
              <p className="text-xs text-bakery-cream/70 mt-0.5">Explore our wide range of premium bakes</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-bakery-gold/20 flex items-center justify-center text-bakery-gold shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-bakery-cream">FSSAI Certified Hygiene</h4>
              <p className="text-xs text-bakery-cream/70 mt-0.5">100% untouched prep & fresh baking daily</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold">
                <img src={logoImg} alt="Satheesh Bakery Logo" className="w-full h-full object-cover" />
              </span>
              <span className="font-serif font-bold text-2xl text-bakery-cream">
                Satheesh <span className="text-bakery-gold italic">Bakery</span>
              </span>
            </Link>
            <p className="text-xs text-bakery-cream/80 leading-relaxed max-w-md">
              Namakkal's trusted premium bakery bringing freshly baked artisanal celebration cakes, hot spicy puffs, sourdough loaves, and classic butter cookies to our customers every day.
            </p>
            {/* Dynamic branch city names */}
            {branches.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-bakery-gold font-semibold">
                {branches.map((b, i) => (
                  <React.Fragment key={b.id}>
                    <span>{b.name.replace('Satheesh Bakery', '').replace('–', '').trim() || b.name}</span>
                    {i < branches.length - 1 && <span className="text-bakery-gold/40">•</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-bakery-gold uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-bakery-cream/80">
              <li><Link to="/menu" className="hover:text-bakery-gold transition-colors">Digital Menu</Link></li>
              <li><Link to="/offers" className="hover:text-bakery-gold transition-colors">Festive Offers</Link></li>
              <li><Link to="/franchise" className="hover:text-bakery-gold transition-colors">Franchise Enquiry</Link></li>
              <li><button onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname === '/' || window.location.pathname === '') {
                  const el = document.getElementById('about');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  // navigate to home and scroll after a short delay
                  window.location.href = '/#about';
                }
              }} className="hover:text-bakery-gold transition-colors">Our Story</button></li>
            </ul>
          </div>

          {/* Our Branches */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-bakery-gold uppercase tracking-wider">Our Branches</h4>
            <ul className="space-y-2 text-xs text-bakery-cream/80">
              {branches.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>{b.name}</span>
                </li>
              ))}
              {branches.length === 0 && (
                <li className="text-bakery-cream/50">Coming soon</li>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-bakery-gold uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-2.5 text-xs text-bakery-cream/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-bakery-gold shrink-0 mt-0.5" />
                <span>{branches.find(b => b.isMain)?.address || 'Namakkal, Tamil Nadu – 637001'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-bakery-gold shrink-0" />
                <a href={`tel:${branches.find(b => b.isMain)?.phone || '+919942645000'}`} className="hover:text-bakery-gold transition-colors">{branches.find(b => b.isMain)?.phone || '+91 99426 45000'}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-bakery-gold shrink-0" />
                <a href={`mailto:${branches.find(b => b.isMain)?.email || 'sivamsathishbakery@gmail.com'}`} className="hover:text-bakery-gold transition-colors">{branches.find(b => b.isMain)?.email || 'sivamsathishbakery@gmail.com'}</a>
              </li>
              <li className="flex items-start gap-2">
                <Link to="/contact" className="hover:text-bakery-gold transition-colors">Contact Us →</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-bakery-brown/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-bakery-cream/60">
          <p>© {new Date().getFullYear()} Satheesh Bakery, Namakkal. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for bakery lovers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
