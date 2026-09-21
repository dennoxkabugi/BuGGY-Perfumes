import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product, CartItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  savedItems: CartItem[];
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSaved: (productId: string) => void;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  totalItems: 0,
  savedItems: [],
  saveForLater: () => {},
  moveToCart: () => {},
  removeSaved: () => {},
});

const CART_KEY = 'buggy_cart';
const SAVED_KEY = 'buggy_saved';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSaved(): CartItem[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [savedItems, setSavedItems] = useState<CartItem[]>(loadSaved);

  const persistCart = useCallback((cart: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, []);

  const persistSaved = useCallback((saved: CartItem[]) => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      let next: CartItem[];
      if (existing) {
        next = prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        next = [...prev, { product, quantity }];
      }
      persistCart(next);
      return next;
    });
  }, [persistCart]);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId);
      persistCart(next);
      return next;
    });
  }, [persistCart]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const next = prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      );
      persistCart(next);
      return next;
    });
  }, [persistCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const saveForLater = useCallback((productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        const saved = savedItems.filter((s) => s.product.id !== productId);
        const newSaved = [...saved, item];
        setSavedItems(newSaved);
        persistSaved(newSaved);
      }
      const next = prev.filter((i) => i.product.id !== productId);
      persistCart(next);
      return next;
    });
  }, [persistCart, persistSaved, savedItems]);

  const moveToCart = useCallback((productId: string) => {
    setSavedItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        setItems((cart) => {
          const existing = cart.find((i) => i.product.id === productId);
          let next: CartItem[];
          if (existing) {
            next = cart.map((i) =>
              i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            next = [...cart, { product: item.product, quantity: 1 }];
          }
          persistCart(next);
          return next;
        });
      }
      const next = prev.filter((i) => i.product.id !== productId);
      persistSaved(next);
      return next;
    });
  }, [persistCart, persistSaved]);

  const removeSaved = useCallback((productId: string) => {
    setSavedItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId);
      persistSaved(next);
      return next;
    });
  }, [persistSaved]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        savedItems,
        saveForLater,
        moveToCart,
        removeSaved,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
