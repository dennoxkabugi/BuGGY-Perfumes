import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X, Search } from 'lucide-react';
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '@/services/admin';
import { adminGetCategories } from '@/services/admin';
import { useToast } from '@/context/ToastContext';
import { formatPrice, slugify } from '@/utils/format';
import type { Product, Category } from '@/types';
import { PageLoader } from '@/components/Loaders';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  brand: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  size: string;
  image_url: string;
  gallery: string[];
  fragrance_notes: { top: string[]; heart: string[]; base: string[] };
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
}

const emptyForm: ProductForm = {
  name: '', slug: '', description: '', brand: '', category_id: '',
  price: 0, compare_at_price: null, stock_quantity: 0, size: '',
  image_url: '', gallery: [],
  fragrance_notes: { top: [], heart: [], base: [] },
  is_featured: false, is_bestseller: false, is_new: false,
};

export function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
    adminGetCategories().then(setCategories).catch(() => {});
  }, []);

  const loadProducts = () => {
    setLoading(true);
    adminGetProducts()
      .then(setProducts)
      .catch(() => toast('Failed to load products', 'error'))
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? '', brand: p.brand,
      category_id: p.category_id ?? '', price: p.price, compare_at_price: p.compare_at_price,
      stock_quantity: p.stock_quantity, size: p.size ?? '', image_url: p.image_url ?? '',
      gallery: p.gallery ?? [],
      fragrance_notes: p.fragrance_notes ?? { top: [], heart: [], base: [] },
      is_featured: p.is_featured, is_bestseller: p.is_bestseller, is_new: p.is_new,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || slugify(form.name) };
      if (editing) {
        await adminUpdateProduct(editing.id, data);
        toast('Product updated successfully');
      } else {
        await adminCreateProduct(data);
        toast('Product created successfully');
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminDeleteProduct(id);
      toast('Product deleted');
      loadProducts();
    } catch {
      toast('Failed to delete product', 'error');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Products ({products.length})</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Product</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Price</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden sm:table-cell">Stock</th>
                <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img src={p.image_url ?? ''} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-neutral-500">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-neutral-600">{p.category?.name ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-neutral-900">{formatPrice(p.price)}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-sm font-medium ${p.stock_quantity <= 10 ? 'text-amber-600' : 'text-neutral-600'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-neutral-400 hover:text-amber-600 transition-colors p-1.5">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-neutral-400 hover:text-red-500 transition-colors p-1.5">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl p-6 border border-neutral-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value ? slugify(e.target.value) : form.slug })} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Brand *</label>
                  <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm">
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Size</label>
                  <input type="text" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="100ml" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Stock</label>
                  <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Price *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Compare At Price</label>
                  <input type="number" step="0.01" value={form.compare_at_price ?? ''} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Image URL</label>
                <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Top Notes (comma separated)</label>
                  <input type="text" value={form.fragrance_notes.top.join(', ')} onChange={(e) => setForm({ ...form, fragrance_notes: { ...form.fragrance_notes, top: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Heart Notes</label>
                  <input type="text" value={form.fragrance_notes.heart.join(', ')} onChange={(e) => setForm({ ...form, fragrance_notes: { ...form.fragrance_notes, heart: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Base Notes</label>
                  <input type="text" value={form.fragrance_notes.base.join(', ')} onChange={(e) => setForm({ ...form, fragrance_notes: { ...form.fragrance_notes, base: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-amber-500" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} className="accent-amber-500" />
                  Bestseller
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="accent-amber-500" />
                  New Arrival
                </label>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-neutral-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
