import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/services/admin';
import { useToast } from '@/context/ToastContext';
import { slugify } from '@/utils/format';
import type { Category } from '@/types';
import { PageLoader } from '@/components/Loaders';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

const emptyForm: CategoryForm = { name: '', slug: '', description: '', image_url: '' };

export function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setLoading(true);
    adminGetCategories()
      .then(setCategories)
      .catch(() => toast('Failed to load categories', 'error'))
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', image_url: c.image_url ?? '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || slugify(form.name) };
      if (editing) {
        await adminUpdateCategory(editing.id, data);
        toast('Category updated');
      } else {
        await adminCreateCategory(data);
        toast('Category created');
      }
      setShowForm(false);
      loadCategories();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in this category will be uncategorized.')) return;
    try {
      await adminDeleteCategory(id);
      toast('Category deleted');
      loadCategories();
    } catch {
      toast('Failed to delete category', 'error');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Categories ({categories.length})</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl p-4 border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900">{cat.name}</p>
                <p className="text-xs text-neutral-500">{cat.slug}</p>
                {cat.description && <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{cat.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="text-neutral-400 hover:text-amber-600 transition-colors p-1">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="text-neutral-400 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl p-6 border border-neutral-200 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value ? slugify(e.target.value) : form.slug })} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Image URL</label>
                <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-neutral-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
