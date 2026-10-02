import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Grid3X3, Store, Users,
  Star, Home, Tag, Activity, Key, LogOut, ChevronLeft, ChevronRight, Menu, Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Products', icon: Package, path: '/admin/products' },
  { label: 'Categories', icon: Grid3X3, path: '/admin/categories' },
  { label: 'Branches', icon: Store, path: '/admin/branches' },
  { label: 'Franchise Enquiries', icon: Users, path: '/admin/franchise' },
  { label: 'Reviews', icon: Star, path: '/admin/reviews' },
  { label: 'Homepage CMS', icon: Home, path: '/admin/homepage' },
  { label: 'Offers Manager', icon: Tag, path: '/admin/offers' },
  { label: 'Activity Logs', icon: Activity, path: '/admin/logs' },
  { label: 'Account', icon: Key, path: '/admin/change-password' },
];

interface SidebarContentProps {
  collapsed: boolean;
  currentPath: string;
  onNavClick: () => void;
  onLogout: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ collapsed, currentPath, onNavClick, onLogout }) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className={`flex items-center gap-3 p-5 border-b border-bakery-beige/20 ${collapsed ? 'justify-center' : ''}`}>
      <div className="w-9 h-9 rounded-xl bg-bakery-gold flex items-center justify-center text-bakery-chocolate font-bold text-lg shrink-0">🍞</div>
      {!collapsed && (
        <div>
          <p className="font-serif font-bold text-sm text-bakery-cream leading-tight">Satheesh Bakery</p>
          <p className="text-[10px] text-bakery-cream/60 uppercase tracking-wider">Admin Portal</p>
        </div>
      )}
    </div>

    {/* Nav Items */}
    <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isActive
                ? 'bg-bakery-gold text-bakery-chocolate'
                : 'text-bakery-cream/70 hover:text-bakery-cream hover:bg-white/10'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>

    {/* Logout */}
    <div className="p-3 border-t border-bakery-beige/20">
      <button
        onClick={onLogout}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-bakery-cream/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-xs ${collapsed ? 'justify-center' : ''}`}
      >
        <LogOut className="w-4 h-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </div>
  </div>
);

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { showToast } = useNotification();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    showToast('Signed out', 'You have been logged out from the admin panel.', 'info');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bakery-beige/20 dark:bg-gray-950 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-bakery-brown dark:bg-gray-900 border-r border-bakery-beige/10 transition-all duration-300 shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent
          collapsed={collapsed}
          currentPath={location.pathname}
          onNavClick={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full w-5 h-8 bg-bakery-brown dark:bg-gray-900 border border-bakery-beige/20 rounded-r-lg flex items-center justify-center text-bakery-cream/50 hover:text-bakery-cream transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 h-full bg-bakery-brown dark:bg-gray-900">
            <SidebarContent
              collapsed={false}
              currentPath={location.pathname}
              onNavClick={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-bakery-beige flex items-center px-4 gap-4 shrink-0">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-bakery-chocolate dark:text-bakery-cream">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="font-bold text-xs text-bakery-chocolate dark:text-bakery-cream">
              {NAV_ITEMS.find(n => location.pathname === n.path || (n.path !== '/admin' && location.pathname.startsWith(n.path)))?.label || 'Admin'}
            </p>
          </div>
          <button className="p-2 rounded-xl hover:bg-bakery-beige/30 text-bakery-chocolate dark:text-bakery-cream">
            <Bell className="w-4 h-4" />
          </button>
          <Link to="/" className="text-xs font-bold text-bakery-brown dark:text-bakery-gold hover:underline">
            View Site →
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

