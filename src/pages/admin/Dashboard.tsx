import React from 'react';
import { Package, Star, AlertTriangle, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../../services/storageService';

export const Dashboard: React.FC = () => {
  const products = StorageService.getProducts();
  const reviews = StorageService.getReviews();
  const franchiseEnquiries = StorageService.getFranchiseEnquiries();

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '–';
  const lowStockProducts = products.filter(p => p.isAvailable === false).length;
  const pendingEnquiries = franchiseEnquiries.filter(e => e.status === 'pending').length;

  const KPI_CARDS = [
    { label: "Total Products", value: products.length, icon: Package, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: "Pending Enquiries", value: pendingEnquiries, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Avg. Customer Rating', value: avgRating + ' ★', icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Disabled/Out of Stock', value: lowStockProducts, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  const recentEnquiries = [...franchiseEnquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    contacted: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream">Admin Dashboard</h1>
        <p className="text-xs text-bakery-chocolate/60 dark:text-bakery-cream/60 mt-0.5">Welcome back — here's your bakery at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {KPI_CARDS.map((card) => (
          <div key={card.label} className={`p-5 rounded-3xl ${card.bg} border border-bakery-beige shadow-xs space-y-2`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color} bg-white dark:bg-gray-900/20`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className={`font-serif font-bold text-2xl ${card.color}`}>{card.value}</p>
            <p className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Manage Products', to: '/admin/products' },
          { label: 'Franchise Leads', to: '/admin/franchise' },
          { label: 'Moderate Reviews', to: '/admin/reviews' },
          { label: 'Manage Branches', to: '/admin/branches' },
        ].map(action => (
          <Link key={action.to} to={action.to}
            className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-bakery-beige shadow-xs hover:border-bakery-gold hover:shadow-warm transition-all flex items-center justify-between font-bold text-xs text-bakery-chocolate dark:text-bakery-cream">
            {action.label} <ArrowRight className="w-3.5 h-3.5 text-bakery-gold" />
          </Link>
        ))}
      </div>

      {/* Recent Enquiries */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-bakery-beige shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-bakery-chocolate dark:text-bakery-cream">Recent Franchise Enquiries</h2>
          <Link to="/admin/franchise" className="text-xs font-bold text-bakery-brown dark:text-bakery-gold hover:underline">View All →</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-bakery-beige">
                <th className="text-left py-2 px-3 font-bold text-bakery-chocolate/60 dark:text-bakery-cream/60">Date</th>
                <th className="text-left py-2 px-3 font-bold text-bakery-chocolate/60 dark:text-bakery-cream/60">Applicant</th>
                <th className="text-left py-2 px-3 font-bold text-bakery-chocolate/60 dark:text-bakery-cream/60">Location</th>
                <th className="text-left py-2 px-3 font-bold text-bakery-chocolate/60 dark:text-bakery-cream/60">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.map((enq) => (
                <tr key={enq.id} className="border-b border-bakery-beige/30 hover:bg-bakery-beige/20">
                  <td className="py-2.5 px-3 text-bakery-chocolate/80 dark:text-bakery-cream/80">{new Date(enq.createdAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3 font-bold text-bakery-chocolate/80 dark:text-bakery-cream/80">{enq.name}</td>
                  <td className="py-2.5 px-3 text-bakery-brown dark:text-bakery-gold">{enq.location}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${STATUS_COLORS[enq.status] || 'bg-gray-100 text-gray-700'}`}>
                      {enq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentEnquiries.length === 0 && (
            <p className="text-center py-8 text-xs text-bakery-chocolate/50 dark:text-bakery-cream/50">No enquiries found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
