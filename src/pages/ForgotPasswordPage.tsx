import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useToast } from '@/context/ToastContext';

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast('Password reset link sent to your email');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col leading-none">
            <span className="text-2xl font-bold text-neutral-900">BuGGY</span>
            <span className="text-xs tracking-[0.3em] text-amber-500 font-medium">PERFUMES</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 mt-6 mb-2">Forgot Password</h1>
          <p className="text-sm text-neutral-500">
            {sent ? 'Check your email for a reset link.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 text-center">
            <Mail className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-sm text-neutral-600 mb-6">
              We have sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-600"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={16} />
            </button>
          </form>
        )}

        <p className="text-center text-sm text-neutral-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-amber-700 font-medium hover:text-amber-600">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
