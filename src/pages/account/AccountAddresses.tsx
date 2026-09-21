import { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Edit3, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAddresses, addAddress, deleteAddress } from '@/services/api';
import type { Address } from '@/types';
import { EmptyState } from '@/components/Loaders';

export function AccountAddresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('Home');
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [area, setArea] = useState('');
  const [building, setBuilding] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (user) {
      getAddresses(user.id)
        .then(setAddresses)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addAddress({
        user_id: user.id,
        label,
        county,
        town,
        area,
        building,
        delivery_instructions: instructions,
        is_default: addresses.length === 0,
      });
      toast('Address added successfully');
      setShowForm(false);
      setLabel('Home');
      setCounty('');
      setTown('');
      setArea('');
      setBuilding('');
      setInstructions('');
      getAddresses(user.id).then(setAddresses);
    } catch {
      toast('Failed to add address', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      toast('Address removed');
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast('Failed to remove address', 'error');
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2].map((i) => <div key={i} className="h-32 bg-neutral-100 rounded-2xl" />)}
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900">My Addresses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          <Plus size={16} /> Add Address
        </button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <EmptyState
          title="No saved addresses"
          message="Add a delivery address to speed up your checkout process."
          actionLabel="Add Address"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl p-5 border border-neutral-200 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-neutral-900">{addr.label}</p>
                  {addr.is_default && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                  )}
                </div>
                <p className="text-sm text-neutral-600">
                  {addr.building && `${addr.building}, `}{addr.area}, {addr.town}, {addr.county}
                </p>
                {addr.delivery_instructions && (
                  <p className="text-xs text-neutral-500 mt-1">{addr.delivery_instructions}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-neutral-400 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl p-6 border border-neutral-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900">Add New Address</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Label</label>
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                >
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">County *</label>
                  <input type="text" value={county} onChange={(e) => setCounty(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Town *</label>
                  <input type="text" value={town} onChange={(e) => setTown(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Estate / Area *</label>
                <input type="text" value={area} onChange={(e) => setArea(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Building / House</label>
                <input type="text" value={building} onChange={(e) => setBuilding(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Delivery Instructions</label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm resize-none" />
              </div>
              <button type="submit" className="w-full bg-neutral-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
