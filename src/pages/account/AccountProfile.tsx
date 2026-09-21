import { useState, useEffect } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/services/supabase';

export function AccountProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFullName(user?.user_metadata?.full_name ?? '');
    setPhone(user?.user_metadata?.phone ?? '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone },
      });
      if (error) throw error;
      await supabase.from('user_profiles').update({ full_name: fullName, phone }).eq('id', user!.id);
      toast('Profile updated successfully');
    } catch {
      toast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Profile Information</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4 max-w-lg">
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 712 345 678"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
