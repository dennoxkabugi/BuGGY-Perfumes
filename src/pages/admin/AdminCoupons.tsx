import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '@/services/admin';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/utils/format';
import type { Coupon } from '@/types';
import { PageLoader } from '@/components/Loaders';

interface CouponForm {
  code: string;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  expires_at: string;
  usage_limit: number | null;
  active: boolean;
}

const emptyForm: CouponForm = {
  code: '', discount_type: 'percentage', discount_value: 0, minimum_order: 0,
  expires_at: '', usage_limit: null, active: true,
};

export function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    setLoading(true);
    adminGetCoupons()
      .then(setCoupons)
      .catch(() => toast('Failed to load coupons', 'error'))
      .finally(() => setLoading(false));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      minimum_order: c.minimum_order,
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
      usage_limit: c.usage_limit,
      active: c.active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        minimum_order: form.minimum_order,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        usage_limit: form.usage_limit,
        active: form.active,
      };
      if (editing) {
        await adminUpdateCoupon(editing.id, data);
        toast('Coupon updated');
      } else {
        await adminCreateCoupon(data);
        toast('Coupon created');
      }
      setShowForm(false);
      loadCoupons();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await adminDeleteCoupon(id);
      toast('Coupon deleted');
      loadCoupons();
    } catch {
      toast('Failed to delete coupon', 'error');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Coupons ({coupons.length})</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Code</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden sm:table-cell">Type</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Value</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden md:table-cell">Min Order</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3 hidden md:table-cell">Expires</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-neutral-900">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-neutral-600 capitalize">{c.discount_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-neutral-900">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-neutral-600">${c.minimum_order}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-neutral-600">{c.expires_at ? formatDate(c.expires_at) : 'Never'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="text-neutral-400 hover:text-amber-600 transition-colors p-1">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-neutral-400 hover:text-red-500 transition-colors p-1">
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
          <div className="relative bg-white rounded-2xl p-6 border border-neutral-200 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">{editing ? 'Edit Coupon' : 'Add Coupon'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Code *</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Value *</label>
                  <input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} required className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Min Order</label>
                  <input type="number" step="0.01" value={form.minimum_order} onChange={(e) => setForm({ ...form, minimum_order: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Usage Limit</label>
                  <input type="number" value={form.usage_limit ?? ''} onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })} placeholder="Unlimited" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Expires At</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-amber-500" />
                Active
              </label>
              <button type="submit" disabled={saving} className="w-full bg-neutral-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
