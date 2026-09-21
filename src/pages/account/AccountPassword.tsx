import { useState } from 'react';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/services/supabase';

export function AccountPassword() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email ?? '',
        password: currentPassword,
      });
      if (error) {
        toast('Current password is incorrect', 'error');
        setLoading(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      toast('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Password & Security</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4 max-w-lg">
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="At least 6 characters"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Confirm New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
