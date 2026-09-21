import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';

export function useWishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      const local = localStorage.getItem('buggy_wishlist');
      setWishlist(local ? JSON.parse(local) : []);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('product:products(*)')
      .eq('user_id', user.id);
    if (!error && data) {
      setWishlist(data.map((w) => w.product as unknown as Product));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((p) => p.id === productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (!user) {
        setWishlist((prev) => {
          const exists = prev.some((p) => p.id === product.id);
          const next = exists
            ? prev.filter((p) => p.id !== product.id)
            : [...prev, product];
          localStorage.setItem('buggy_wishlist', JSON.stringify(next));
          return next;
        });
        return;
      }
      const exists = wishlist.some((p) => p.id === product.id);
      if (exists) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: product.id });
        setWishlist((prev) => [...prev, product]);
      }
    },
    [user, wishlist]
  );

  const removeWishlist = useCallback(
    async (productId: string) => {
      if (!user) {
        setWishlist((prev) => {
          const next = prev.filter((p) => p.id !== productId);
          localStorage.setItem('buggy_wishlist', JSON.stringify(next));
          return next;
        });
        return;
      }
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
    },
    [user]
  );

  return { wishlist, isInWishlist, toggleWishlist, removeWishlist, loading, refetch: fetchWishlist };
}
