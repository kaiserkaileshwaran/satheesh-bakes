import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Package, Image as ImageIcon } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../utils/avatarGenerator';
import { useNotification } from '../../contexts/NotificationContext';
import { ImageUpload } from '../../components/admin/ImageUpload';

const EMPTY: Partial<Product> = {
  name: '', description: '', price: 0, offerPrice: undefined,
  categoryId: '', coverImage: '', isAvailable: true, isEggless: false, isSpicy: false,
  images: [],
};

export const ProductsManager: React.FC = () => {
  const { showToast } = useNotification();
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories());
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(EMPTY);
  const [isNew, setIsNew] = useState(true);

  // Listen for real-time data updates
  useEffect(() => {
    const handler = () => {
      setProducts(StorageService.getProducts());
      setCategories(StorageService.getCategories());
    };
    window.addEventListener('sb_data_change', handler);
    return () => window.removeEventListener('sb_data_change', handler);
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing({ ...EMPTY, images: [] }); setIsNew(true); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing({ ...p }); setIsNew(false); setModalOpen(true); };

  const handleSave = () => {
    if (!editing.name || !editing.price) {
      showToast('Validation Error', 'Name and price are required.', 'error');
      return;
    }

    // Sync: first image in array = cover image
    const allImages = editing.images || [];
    const cover = editing.coverImage || (allImages[0] || '');

    if (isNew) {
      const newProduct: Product = {
        ...editing as Product,
        id: 'prod-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          sweetness: 0,
          spice: 0,
          softness: 0,
          crunchiness: 0,
          temperature: 'room',
          diet: 'eggless',
          prepTime: 0,
          occasion: [],
          tags: [],
          allergens: [],
        },
        images: allImages,
        coverImage: cover,
        description: editing.description || '',
        ingredients: editing.ingredients || [],
        price: editing.price || 0,
        categoryId: editing.categoryId || '',
        rating: editing.rating || 0,
        reviewCount: editing.reviewCount || 0,
        featured: editing.featured ?? false,
        bestSeller: editing.bestSeller ?? false,
        isNewArrival: editing.isNewArrival ?? false,
        isAvailable: editing.isAvailable ?? true,
        isEggless: editing.isEggless ?? false,
        status: editing.status || 'draft',
      };
      StorageService.saveProduct(newProduct);
      showToast('Product Created', editing.name + ' has been added.', 'success');
    } else {
      StorageService.saveProduct({
        ...(editing as Product),
        images: allImages,
        coverImage: cover,
      });
      showToast('Product Updated', editing.name + ' has been updated.', 'success');
    }
    setProducts(StorageService.getProducts());
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      StorageService.deleteProduct(id);
      setProducts(StorageService.getProducts());
      showToast('Product Deleted', name + ' has been removed.', 'info');
    }
  };

  // ImageUpload onChange callback
  const handleImagesChange = (val: string | string[]) => {
    const imgs = Array.isArray(val) ? val : (val ? [val] : []);
    const cover = imgs[0] || '';
    setEditing(f => ({ ...f, images: imgs, coverImage: cover }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif font-bold text-2xl text-bakery-chocolate dark:text-bakery-cream">Products Manager</h1>
        <button onClick={openNew} className="px-4 py-2 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-xs hover:bg-bakery-brown-dark flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-bakery-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream" />
      </div>

      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-bakery-beige overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-bakery-beige/30 dark:bg-gray-800">
              <tr>
                {['Product', 'Category', 'Price', 'Status', 'Flags', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-bakery-chocolate/50 dark:text-bakery-cream/50">
                    <Package className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>No products found.</p>
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-bakery-beige/30 hover:bg-bakery-beige/10">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {p.coverImage ? (
                        <img src={p.coverImage} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-bakery-beige flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-5 h-5 text-bakery-brown/30" />
                        </div>
                      )}
                      <span className="font-bold text-bakery-chocolate dark:text-bakery-cream">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-bakery-chocolate/70 dark:text-bakery-cream/70 text-[11px]">
                    {categories.find(c => c.id === p.categoryId)?.name || p.categoryId}
                  </td>
                  <td className="py-3 px-4 font-bold">{formatCurrency(p.price)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                      p.status === 'published' ? 'bg-emerald-100 text-emerald-700'
                      : p.status === 'archived' ? 'bg-gray-100 text-gray-500'
                      : 'bg-amber-100 text-amber-700'
                    }`}>{p.status || 'draft'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.bestSeller && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">Best</span>}
                      {p.featured && <span className="px-1.5 py-0.5 rounded bg-bakery-gold/20 text-bakery-brown text-[10px] font-bold">Feat</span>}
                      {p.isNewArrival && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">New</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-bakery-gold/10 hover:bg-bakery-gold/20 text-bakery-brown">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-900 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-bakery-chocolate dark:text-bakery-cream">{isNew ? 'Add New Product' : 'Edit Product'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-bakery-chocolate/60" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Product Name *</label>
                <input value={editing.name || ''} onChange={e => setEditing(f => ({...f, name: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream" />
              </div>
              <div>
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Price (₹) *</label>
                <input type="number" value={editing.price || ''} onChange={e => setEditing(f => ({...f, price: +e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream" />
              </div>
              <div>
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Offer Price (₹)</label>
                <input type="number" value={editing.offerPrice || ''} onChange={e => setEditing(f => ({...f, offerPrice: +e.target.value || undefined}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream" />
              </div>
              <div>
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Category</label>
                <select value={editing.categoryId || ''} onChange={e => setEditing(f => ({...f, categoryId: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream">
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Status</label>
                <select value={editing.status || 'draft'} onChange={e => setEditing(f => ({...f, status: e.target.value as 'published' | 'draft' | 'archived' | 'out_of_stock'}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-2 block">
                  Product Images (First image = Cover)
                </label>
                <ImageUpload
                  value={editing.images && editing.images.length > 0 ? editing.images : (editing.coverImage ? [editing.coverImage] : [])}
                  onChange={handleImagesChange}
                  folder="products"
                  isMultiple={true}
                  maxFiles={5}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Description</label>
                <textarea rows={3} value={editing.description || ''} onChange={e => setEditing(f => ({...f, description: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream resize-none" />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.isAvailable ?? true} onChange={e => setEditing(f => ({...f, isAvailable: e.target.checked}))} className="accent-bakery-brown" />
                  <span className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.bestSeller ?? false} onChange={e => setEditing(f => ({...f, bestSeller: e.target.checked}))} className="accent-bakery-brown" />
                  <span className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.featured ?? false} onChange={e => setEditing(f => ({...f, featured: e.target.checked}))} className="accent-bakery-brown" />
                  <span className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.isNewArrival ?? false} onChange={e => setEditing(f => ({...f, isNewArrival: e.target.checked}))} className="accent-bakery-brown" />
                  <span className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.isEggless ?? false} onChange={e => setEditing(f => ({...f, isEggless: e.target.checked}))} className="accent-bakery-brown" />
                  <span className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70">Eggless</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-bakery-beige text-xs font-bold text-bakery-chocolate dark:text-bakery-cream">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-bakery-brown text-bakery-cream text-xs font-bold hover:bg-bakery-brown-dark">{isNew ? 'Add Product' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
