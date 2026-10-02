import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Clock, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Offer } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import { useDataSync } from '../../hooks/useDataSync';

export const OffersCMS: React.FC = () => {
  const { showToast } = useNotification();
  const offers = useDataSync(() => StorageService.getAllOffers());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Offer>>({ title: '', description: '', discountPercentage: 10, startDate: '', startTime: '00:00', endDate: '', endTime: '23:59', enabled: true, bannerUrl: '' });
  const [isNew, setIsNew] = useState(true);

  const openNew = () => { setEditing({ title: '', description: '', discountPercentage: 10, startDate: new Date().toISOString().split('T')[0], startTime: '00:00', endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], endTime: '23:59', enabled: true, bannerUrl: '' }); setIsNew(true); setModalOpen(true); };
  const openEdit = (o: Offer) => { setEditing({ ...o }); setIsNew(false); setModalOpen(true); };

  const handleSave = () => {
    if (!editing.title) { showToast('Error', 'Title is required.', 'error'); return; }
    if (!editing.startDate || !editing.endDate) { showToast('Error', 'Start and End dates are required.', 'error'); return; }
    
    if (isNew) {
      StorageService.saveOffer({ ...editing as Offer, id: 'offer-' + Date.now() });
      StorageService.addActivityLog('Admin', 'admin', 'Offer Created', 'Offers', `Created new offer "${editing.title}".`);
    } else {
      StorageService.saveOffer(editing as Offer);
      StorageService.addActivityLog('Admin', 'admin', 'Offer Updated', 'Offers', `Updated offer "${editing.title}".`);
    }
    showToast('Saved', 'Offer saved.', 'success');
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this offer?')) {
      const offerToDelete = offers.find(o => o.id === id);
      StorageService.deleteOffer(id);
      if (offerToDelete) {
        StorageService.addActivityLog('Admin', 'admin', 'Offer Deleted', 'Offers', `Deleted offer "${offerToDelete.title}".`);
      }
      showToast('Deleted', 'Offer removed.', 'info');
    }
  };

  const toggleEnabled = (offer: Offer) => {
    StorageService.saveOffer({ ...offer, enabled: !offer.enabled });
    StorageService.addActivityLog('Admin', 'admin', offer.enabled ? 'Offer Disabled' : 'Offer Enabled', 'Offers', `Toggled offer status for "${offer.title}".`);
    showToast('Updated', `Offer ${offer.enabled ? 'disabled' : 'enabled'}.`, 'success');
  };

  const now = new Date();
  const activeOffers = offers.filter(o => {
    const end = new Date(`${o.endDate}T${o.endTime}`);
    return now <= end;
  });
  const expiredOffers = offers.filter(o => {
    const end = new Date(`${o.endDate}T${o.endTime}`);
    return now > end;
  });

  const renderOfferCard = (offer: Offer) => (
    <div key={offer.id} className={`rounded-3xl bg-white dark:bg-gray-900 border border-bakery-beige shadow-xs overflow-hidden transition-opacity ${offer.enabled ? 'opacity-100' : 'opacity-60 grayscale'}`}>
      {offer.bannerUrl && <img src={offer.bannerUrl} alt={offer.title} className="w-full h-32 object-cover" />}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-bakery-chocolate dark:text-bakery-cream">{offer.title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">{offer.discountPercentage}% OFF</span>
        </div>
        <p className="text-xs text-bakery-chocolate/60 dark:text-bakery-cream/60 line-clamp-2">{offer.description}</p>
        <p className="text-xs text-bakery-chocolate/50 dark:text-bakery-cream/50 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {offer.startDate} {offer.startTime} – {offer.endDate} {offer.endTime}
        </p>
        <div className="flex gap-2 pt-1">
          <button onClick={() => toggleEnabled(offer)} className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 ${offer.enabled ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
             {offer.enabled ? 'Disable' : 'Enable'}
          </button>
          <button onClick={() => openEdit(offer)} className="flex-1 py-2 rounded-xl bg-bakery-gold/10 hover:bg-bakery-gold/20 text-bakery-brown font-bold text-xs flex items-center justify-center gap-1">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => handleDelete(offer.id)} className="flex-1 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold text-xs flex items-center justify-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream">Offers Manager</h1>
        <button onClick={openNew} className="px-4 py-2 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-xs hover:bg-bakery-brown-dark flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Offer
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-bakery-chocolate dark:text-bakery-cream flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Active & Scheduled Offers
        </h2>
        {activeOffers.length === 0 ? (
          <p className="text-sm text-bakery-chocolate/50">No active offers.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeOffers.map(renderOfferCard)}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6 border-t border-bakery-beige/30">
        <h2 className="font-serif font-bold text-xl text-bakery-chocolate/60 dark:text-bakery-cream/60 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Expired Offers
        </h2>
        {expiredOffers.length === 0 ? (
          <p className="text-sm text-bakery-chocolate/50">No expired offers.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
            {expiredOffers.map(renderOfferCard)}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between">
              <h2 className="font-bold text-base text-bakery-chocolate dark:text-bakery-cream">{isNew ? 'New Offer' : 'Edit Offer'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-bakery-chocolate/60" /></button>
            </div>
            {[
              { label: 'Title', key: 'title', type: 'text' },
              { label: 'Description', key: 'description', type: 'text' },
              { label: 'Discount (%)', key: 'discountPercentage', type: 'number' },
              { label: 'Start Date', key: 'startDate', type: 'date' },
              { label: 'Start Time', key: 'startTime', type: 'time' },
              { label: 'End Date', key: 'endDate', type: 'date' },
              { label: 'End Time', key: 'endTime', type: 'time' },
              { label: 'Banner Image URL', key: 'bannerUrl', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">{field.label}</label>
                <input type={field.type} value={(editing as Record<string, string | number | boolean>)[field.key] as string | number || ''} onChange={e => setEditing(f => ({...f, [field.key]: field.type === 'number' ? +e.target.value : e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-bakery-beige text-xs font-bold text-bakery-chocolate dark:text-bakery-cream">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-bakery-brown text-bakery-cream text-xs font-bold flex items-center justify-center gap-1">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
