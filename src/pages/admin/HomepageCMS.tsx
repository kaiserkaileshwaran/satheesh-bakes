import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';
import { HeroBanner, HomepageCMS as HomepageCMSType } from '../../types';

export const HomepageCMS: React.FC = () => {
  const { showToast } = useNotification();
  const [cms, setCMS] = useState<HomepageCMSType>(StorageService.getHomepageCMS());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBanner>>({});
  const [isNew, setIsNew] = useState(true);

  const openNew = () => {
    setEditingBanner({ title: '', subtitle: '', buttonText: 'View Menu', buttonLink: '/menu', desktopImage: '', mobileImage: '', enabled: true, displayOrder: (cms.banners?.length || 0) + 1 });
    setIsNew(true);
    setModalOpen(true);
  };
  const openEdit = (b: HeroBanner) => { setEditingBanner({ ...b }); setIsNew(false); setModalOpen(true); };

  const handleSave = () => {
    if (!editingBanner.title) { showToast('Error', 'Title is required.', 'error'); return; }
    const banners = cms.banners || [];
    let updated: HeroBanner[];
    if (isNew) {
      updated = [...banners, { ...editingBanner, id: `banner-${Date.now()}` } as HeroBanner];
    } else {
      updated = banners.map(b => b.id === editingBanner.id ? { ...editingBanner } as HeroBanner : b);
    }
    const newCMS = { ...cms, banners: updated };
    StorageService.saveHomepageCMS(newCMS);
    setCMS(newCMS);
    showToast('Saved', 'Banner saved successfully.', 'success');
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this banner?')) return;
    const updated = (cms.banners || []).filter(b => b.id !== id);
    const newCMS = { ...cms, banners: updated };
    StorageService.saveHomepageCMS(newCMS);
    setCMS(newCMS);
    showToast('Deleted', 'Banner removed.', 'info');
  };

  const banners = cms.banners || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream">Homepage CMS</h1>
          <p className="text-xs text-bakery-chocolate/60 dark:text-bakery-cream/60 mt-0.5">Manage the hero banners displayed on the home page.</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-xs hover:bg-bakery-brown-dark flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {banners.map(banner => (
          <div key={banner.id} className="rounded-3xl bg-white dark:bg-gray-900 border border-bakery-beige shadow-xs overflow-hidden flex gap-4">
            {banner.desktopImage && (
              <img src={banner.desktopImage} alt={banner.title} className="w-40 h-28 object-cover shrink-0" />
            )}
            <div className="flex-1 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-bakery-chocolate dark:text-bakery-cream">{banner.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${banner.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {banner.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-bakery-chocolate/60 dark:text-bakery-cream/60">{banner.subtitle}</p>
              <p className="text-xs text-bakery-chocolate/50 dark:text-bakery-cream/50">CTA: {banner.buttonText} → {banner.buttonLink}</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => openEdit(banner)} className="py-1.5 px-3 rounded-xl bg-bakery-gold/10 hover:bg-bakery-gold/20 text-bakery-brown font-bold text-xs flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(banner.id)} className="py-1.5 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold text-xs flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-center py-10 text-bakery-chocolate/40 dark:text-bakery-cream/40 text-sm">No banners yet. Click "Add Banner" to create the first one.</p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between">
              <h2 className="font-bold text-base text-bakery-chocolate dark:text-bakery-cream">{isNew ? 'New Banner' : 'Edit Banner'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-bakery-chocolate/60" /></button>
            </div>
            {[
              { label: 'Title', key: 'title', type: 'text' },
              { label: 'Subtitle', key: 'subtitle', type: 'text' },
              { label: 'Desktop Image URL', key: 'desktopImage', type: 'text' },
              { label: 'Mobile Image URL', key: 'mobileImage', type: 'text' },
              { label: 'Button Text', key: 'buttonText', type: 'text' },
              { label: 'Button Link', key: 'buttonLink', type: 'text' },
              { label: 'Display Order', key: 'displayOrder', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">{field.label}</label>
                <input type={field.type} value={(editingBanner as Record<string, string | number | boolean>)[field.key] as string | number || ''}
                  onChange={e => setEditingBanner(f => ({...f, [field.key]: field.type === 'number' ? +e.target.value : e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream" />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="bannerEnabled" checked={!!editingBanner.enabled}
                onChange={e => setEditingBanner(f => ({...f, enabled: e.target.checked}))}
                className="accent-bakery-brown" />
              <label htmlFor="bannerEnabled" className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">Enabled</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-bakery-beige text-xs font-bold text-bakery-chocolate dark:text-bakery-cream">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-bakery-brown text-bakery-cream text-xs font-bold flex items-center justify-center gap-1">
                <Save className="w-3.5 h-3.5" /> Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
