import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Clock, Mail, Phone, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';
import { useDataSync } from '../../hooks/useDataSync';
import { Branch } from '../../types';

const emptyBranch: Partial<Branch> = {
  name: '', address: '', phone: '', email: '',
  googleMapLink: '',
  openingHours: '08:00 AM', closingHours: '10:00 PM',
  isOpen: true, managerName: '',
};

export const BranchesManager: React.FC = () => {
  const { showToast } = useNotification();
  const branches = useDataSync(() => StorageService.getBranches());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>(emptyBranch);

  const openAdd = () => { setEditingBranch(null); setFormData(emptyBranch); setIsModalOpen(true); };
  const openEdit = (branch: Branch) => { setEditingBranch(branch); setFormData({ ...branch }); setIsModalOpen(true); };

  const handleDelete = (branch: Branch) => {
    if (!confirm(`Delete "${branch.name}"? This cannot be undone.`)) return;
    StorageService.deleteBranch(branch.id);
    showToast('Branch Deleted', `"${branch.name}" has been removed.`, 'info');
  };

  const handleToggle = (branch: Branch) => {
    StorageService.saveBranch({ ...branch, isOpen: !branch.isOpen });
    showToast('Status Updated', `${branch.name} is now ${!branch.isOpen ? 'Open' : 'Closed'}.`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toSave: Branch = { ...(formData as Branch), id: editingBranch ? editingBranch.id : `branch-${Date.now()}` };
    
    // Enforce single main branch
    if (toSave.isMain) {
      branches.forEach(b => {
        if (b.id !== toSave.id && b.isMain) {
          StorageService.saveBranch({ ...b, isMain: false });
        }
      });
    }

    StorageService.saveBranch(toSave);
    setIsModalOpen(false);
    showToast(editingBranch ? 'Branch Updated' : 'Branch Added', `"${toSave.name}" saved successfully.`, 'success');
  };

  const set = (field: keyof Branch, value: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream">Branches Manager</h1>
          <p className="text-xs text-bakery-chocolate/60 dark:text-bakery-cream/60 mt-0.5">Manage all Satheesh Bakery locations.</p>
        </div>
        <button onClick={openAdd} className="shrink-0 px-4 py-2.5 bg-bakery-brown text-bakery-cream font-bold text-sm rounded-xl hover:bg-bakery-brown-dark transition-colors flex items-center gap-2 shadow-warm">
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-bakery-beige text-bakery-chocolate/50 dark:text-bakery-cream/50">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-bold">No branches yet.</p>
          <p className="text-xs mt-1">Click "Add Branch" to create your first location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-bakery-beige shadow-xs space-y-4 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-bakery-chocolate dark:text-bakery-cream leading-tight">{branch.name}</h3>
                    {branch.isMain && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Main</span>}
                  </div>
                  {branch.managerName && <p className="text-[11px] text-bakery-chocolate/50 dark:text-bakery-cream/50 mt-0.5">Mgr: {branch.managerName}</p>}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(branch)} title="Edit" className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(branch)} title="Delete" className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70 flex-1">
                <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 text-bakery-brown shrink-0" /><span>{branch.address}</span></p>
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-bakery-brown shrink-0" /><span>{branch.phone}</span></p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-bakery-brown shrink-0" /><span className="truncate">{branch.email}</span></p>
                <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-bakery-brown shrink-0" /><span>{branch.openingHours} – {branch.closingHours}</span></p>
              </div>
              <div className="pt-3 border-t border-bakery-beige flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${branch.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {branch.isOpen ? 'Open' : 'Closed'}
                </span>
                <button onClick={() => handleToggle(branch)} className={`transition-colors ${branch.isOpen ? 'text-emerald-500' : 'text-rose-400'}`}>
                  {branch.isOpen ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 text-bakery-chocolate dark:text-bakery-cream w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center px-6 py-5 border-b border-bakery-beige">
              <h2 className="font-serif font-bold text-xl">{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-bakery-beige/50 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">Branch Name *</label>
                  <input required type="text" value={formData.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Satheesh Bakery – Namakkal Main" className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">Full Address *</label>
                  <input required type="text" value={formData.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="e.g. 45, Tiruchengode Road, Namakkal – 637001" className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Phone *</label>
                  <input required type="text" value={formData.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+91 99426 45000" className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Email</label>
                  <input type="email" value={formData.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="namakkal@satheeshbakery.com" className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Opening Time *</label>
                  <input required type="text" value={formData.openingHours || ''} onChange={(e) => set('openingHours', e.target.value)} placeholder="08:00 AM" className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Closing Time *</label>
                  <input required type="text" value={formData.closingHours || ''} onChange={(e) => set('closingHours', e.target.value)} placeholder="10:00 PM" className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Manager Name</label>
                  <input type="text" value={formData.managerName || ''} onChange={(e) => set('managerName', e.target.value)} placeholder="e.g. Satheesh Kumar" className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">Google Maps Link</label>
                  <input type="url" value={formData.googleMapLink || ''} onChange={(e) => set('googleMapLink', e.target.value)} placeholder="https://maps.google.com/..." className="w-full px-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input id="isOpenCheck" type="checkbox" checked={!!formData.isOpen} onChange={(e) => set('isOpen', e.target.checked)} className="w-4 h-4 accent-bakery-brown" />
                  <label htmlFor="isOpenCheck" className="text-xs font-bold cursor-pointer">Branch is currently open for customers</label>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input id="isMainCheck" type="checkbox" checked={!!formData.isMain} onChange={(e) => set('isMain', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                  <label htmlFor="isMainCheck" className="text-xs font-bold cursor-pointer text-amber-700">Set as Main Branch (will un-set any other main branch)</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-bakery-beige">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-bakery-chocolate/70 dark:text-bakery-cream/70 hover:bg-bakery-beige/50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-bakery-brown text-bakery-cream hover:bg-bakery-brown-dark transition-colors flex items-center gap-2 shadow-warm">
                  <Save className="w-4 h-4" />{editingBranch ? 'Update Branch' : 'Add Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
