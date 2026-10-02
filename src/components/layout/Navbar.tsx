import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User as UserIcon, Menu as MenuIcon, X, ShieldCheck, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoImg from '../../assets/logo.jpg';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Offers', path: '/offers' },
    { label: 'Franchise', path: '/franchise' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full glass-card border-b border-bakery-beige/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-warm group-hover:scale-105 transition-transform">
              <img src={logoImg} alt="Satheesh Bakery Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-bakery-chocolate dark:text-bakery-cream tracking-tight block leading-none">
                Satheesh <span className="text-bakery-gold italic">Bakery</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-bakery-brown/70 dark:text-bakery-gold/80 block mt-0.5">
                Fresh Daily
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-bakery-brown text-bakery-cream font-semibold shadow-sm'
                      : 'text-bakery-chocolate/80 hover:text-bakery-brown hover:bg-bakery-beige/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            



            {/* User Profile / Auth Button */}
            <div className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border-2 border-bakery-gold hover:opacity-90 transition-opacity"
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center font-bold text-xs shadow-xs"
                    style={{
                      backgroundColor: user.avatar.background,
                      color: user.avatar.textColor,
                      borderRadius:
                        user.avatar.shape === 'circle'
                          ? '50%'
                          : user.avatar.shape === 'rounded'
                          ? '1rem'
                          : '0.35rem',
                    }}
                  >
                    {user.avatar.text}
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bakery-brown/10 hover:bg-bakery-brown/20 text-bakery-brown font-semibold text-xs transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Profile Dropdown */}
              {profileDropdownOpen && user && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-bakery-chocolate rounded-2xl shadow-warm-lg border border-bakery-beige p-3 z-50 animate-slide-up">
                  <div className="flex items-center gap-3 p-2 border-b border-bakery-beige/50 pb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs"
                      style={{
                        backgroundColor: user.avatar.background,
                        color: user.avatar.textColor,
                      }}
                    >
                      {user.avatar.text}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-bakery-chocolate dark:text-bakery-cream truncate">{user.fullName}</h4>
                      <p className="text-xs text-bakery-brown/70 dark:text-bakery-gold/80 truncate">@{user.username}</p>
                    </div>
                  </div>


                  <div className="py-2 space-y-1">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-bakery-gold/20 text-bakery-chocolate dark:text-bakery-gold hover:bg-bakery-gold/30 transition-colors mt-1"
                      >
                        <ShieldCheck className="w-4 h-4 text-bakery-gold" /> Admin Control Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="pt-2 border-t border-bakery-beige/50">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-bakery-beige/60 text-bakery-chocolate transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-bakery-beige bg-white dark:bg-bakery-chocolate px-4 pt-3 pb-6 space-y-2 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === link.path
                  ? 'bg-bakery-brown text-bakery-cream'
                  : 'text-bakery-chocolate hover:bg-bakery-beige/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
