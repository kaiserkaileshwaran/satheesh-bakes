import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Category } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

const ICONS = ['🎂', '🥐', '🍞', '🥧', '🍩', '☕', '🍪', '🫓', '🥗', '🍱'];

export const CategoriesManager: React.FC = () => {
  const { showToast } = useNotification();
  const [categories, setCategories] = useState(StorageService.getCategories());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Category>>({ name: '', icon: '🎂', isActive: true });
  const [isNew, setIsNew] = useState(true);

  const openNew = () => { setEditing({ name: '', icon: '🎂', isActive: true }); setIsNew(true); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing({ ...c }); setIsNew(false); setModalOpen(true); };

  const handleSave = () => {
    if (!editing.name) { showToast('Error', 'Category name required.', 'error'); return; }
    if (isNew) {
      const newCat: Category = { ...editing as Category, id: 'cat-' + Date.now(), productCount: 0 };
      StorageService.saveCategory(newCat);
    } else {
      StorageService.saveCategory(editing as Category);
    }
    setCategories(StorageService.getCategories());
    showToast('Saved', editing.name + ' category saved.', 'success');
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      StorageService.deleteCategory(id);
      setCategories(StorageService.getCategories());
      showToast('Deleted', name + ' removed.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream">Categories Manager</h1>
        <button onClick={openNew} className="px-4 py-2 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-xs hover:bg-bakery-brown-dark flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-bakery-beige shadow-xs text-center space-y-2">
            <span className="text-3xl">{cat.icon}</span>
            <p className="font-bold text-sm text-bakery-chocolate dark:text-bakery-cream">{cat.name}</p>
            <p className="text-xs text-bakery-chocolate/50 dark:text-bakery-cream/50">{cat.productCount || 0} products</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg bg-bakery-gold/10 hover:bg-bakery-gold/20 text-bakery-brown">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 p-6 space-y-4">
            <div className="flex justify-between">
              <h2 className="font-bold text-base text-bakery-chocolate dark:text-bakery-cream">{isNew ? 'New Category' : 'Edit Category'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-bakery-chocolate/60" /></button>
            </div>
            <div>
              <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Name</label>
              <input value={editing.name || ''} onChange={e => setEditing(f => ({...f, name: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream" />
            </div>
            <div>
              <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(icon => (
                  <button key={icon} onClick={() => setEditing(f => ({...f, icon}))}
                    className={`text-xl p-2 rounded-xl border-2 transition-all ${editing.icon === icon ? 'border-bakery-gold bg-bakery-gold/10' : 'border-bakery-beige'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-bakery-beige text-xs font-bold text-bakery-chocolate dark:text-bakery-cream">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-bakery-brown text-bakery-cream text-xs font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
