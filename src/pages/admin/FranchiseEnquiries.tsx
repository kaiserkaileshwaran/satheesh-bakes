import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Store, CheckCircle, Clock } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { FranchiseEnquiry } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
 // if needed

export const FranchiseEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<FranchiseEnquiry[]>([]);
  const { showToast } = useNotification();

  const loadEnquiries = () => {
    const data = StorageService.getFranchiseEnquiries();
    // Sort by newest first
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setEnquiries(data);
  };

  useEffect(() => {
    const timeout = setTimeout(() => loadEnquiries(), 0);
    return () => clearTimeout(timeout);
  }, []); // loadEnquiries is stable

  const updateStatus = (id: string, newStatus: 'pending' | 'contacted' | 'rejected') => {
    const current = StorageService.getFranchiseEnquiries().find(e => e.id === id);
    if (current) {
      StorageService.saveFranchiseEnquiry({ ...current, status: newStatus });
      StorageService.addActivityLog('Admin', 'admin', 'Status Changed', 'Franchise', `Updated enquiry from "${current.name}" to ${newStatus}.`);
    }
    showToast('Status Updated', `Enquiry marked as ${newStatus}`, 'success');
    loadEnquiries();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'contacted': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bakery-chocolate dark:text-bakery-cream font-serif">Franchise Enquiries</h1>
          <p className="text-sm text-bakery-chocolate/70 dark:text-bakery-cream/70 mt-1">Manage and respond to prospective franchise partners.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-bakery-chocolate rounded-xl border border-bakery-beige shadow-sm">
            <span className="text-xs font-bold text-bakery-chocolate/60 dark:text-bakery-cream/60 uppercase">Total Enquiries</span>
            <div className="text-lg font-bold text-bakery-chocolate dark:text-bakery-cream">{enquiries.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-bakery-chocolate rounded-2xl shadow-sm border border-bakery-beige overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bakery-beige/30 border-b border-bakery-beige">
              <tr className="text-left text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 uppercase tracking-wider">
                <th className="p-4">Applicant</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Proposed Location</th>
                <th className="p-4">Investment & Exp.</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bakery-beige">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-bakery-beige/10 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-sm text-bakery-chocolate dark:text-bakery-cream">{enq.name}</p>
                    <p className="text-xs text-bakery-chocolate/50 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-4 space-y-1">
                    <p className="text-sm flex items-center gap-1.5 text-bakery-chocolate dark:text-bakery-cream">
                      <Phone className="w-3.5 h-3.5 text-bakery-brown" /> {enq.phone}
                    </p>
                    <p className="text-sm flex items-center gap-1.5 text-bakery-chocolate dark:text-bakery-cream">
                      <Mail className="w-3.5 h-3.5 text-bakery-brown" /> {enq.email}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm flex items-center gap-1.5 text-bakery-chocolate dark:text-bakery-cream">
                      <MapPin className="w-3.5 h-3.5 text-bakery-brown" /> {enq.location}
                    </p>
                  </td>
                  <td className="p-4 space-y-1">
                    <p className="text-sm font-bold text-bakery-chocolate dark:text-bakery-cream">
                      {enq.investmentBudget}
                    </p>
                    {enq.hasExperience ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Store className="w-3 h-3" /> Has F&B Exp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800">
                        New to F&B
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(enq.status)}`}>
                      {enq.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {enq.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStatus(enq.id, 'contacted')}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                          title="Mark as Contacted"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(enq.id, 'rejected')}
                          className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {enq.message && (
                      <p className="mt-2 text-xs italic text-bakery-chocolate/60 dark:text-bakery-cream/60 max-w-[150px] truncate" title={enq.message}>
                        "{enq.message}"
                      </p>
                    )}
                  </td>
                </tr>
              ))}
              {enquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-bakery-chocolate/50">
                    No franchise enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
