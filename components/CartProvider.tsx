'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';
import {
  computeTotals, clampQty, type PublicProduct, type CartLine, type CartTotals,
} from '@/lib/cart';

const LS_KEY = 'carazin_cart_v1'; // guest cart: { [slug]: qty }

type Toast = { id: number; msg: string; err?: boolean };

type CartContextValue = {
  items: CartLine[];
  totals: CartTotals;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  toast: (msg: string, err?: boolean) => void;
  toasts: Toast[];
};

const CartContext = createContext<CartContextValue | null>(null);

function readGuest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function writeGuest(map: Record<string, number>) {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [productsBySlug, setProductsBySlug] = useState<Record<string, PublicProduct>>({});
  const [items, setItems] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const productsById = useMemo(() => {
    const m: Record<string, PublicProduct> = {};
    Object.values(productsBySlug).forEach((p) => { m[p.id] = p; });
    return m;
  }, [productsBySlug]);

  const toast = useCallback((msg: string, err = false) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, err }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  // Load catalog once.
  useEffect(() => {
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: PublicProduct[]) => {
        if (Array.isArray(list)) {
          const bySlug: Record<string, PublicProduct> = {};
          list.forEach((p) => { bySlug[p.slug] = p; });
          setProductsBySlug(bySlug);
        }
      })
      .catch(() => {});
  }, []);

  const guestLines = useCallback(
    (map: Record<string, number>): CartLine[] =>
      Object.entries(map)
        .map(([slug, quantity]) => ({ product: productsBySlug[slug], quantity }))
        .filter((l): l is CartLine => !!l.product && l.quantity > 0),
    [productsBySlug],
  );

  // Sync cart when auth state (or catalog) changes.
  useEffect(() => {
    let cancelled = false;
    async function sync() {
      if (user) {
        const guest = readGuest();
        const entries = Object.entries(guest)
          .filter(([, q]) => q > 0)
          .map(([slug, qty]) => ({ slug, qty }));
        try {
          const res = entries.length
            ? await fetch('/api/cart/merge', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: entries }),
              })
            : await fetch('/api/cart');
          // If the server doesn't recognise the session (e.g. stale cookie → 401),
          // fall back to the guest cart WITHOUT clearing it.
          if (!res.ok) {
            if (!cancelled) setItems(guestLines(readGuest()));
            return;
          }
          const data = await res.json();
          if (!cancelled) {
            setItems(data.items || []);
            if (entries.length) writeGuest({}); // guest cart folded into the account only on success
          }
        } catch { if (!cancelled) setItems(guestLines(readGuest())); }
      } else {
        if (!cancelled) setItems(guestLines(readGuest()));
      }
    }
    sync();
    return () => { cancelled = true; };
  }, [user, productsBySlug, guestLines]);

  // ── Mutations ──
  const add = useCallback(async (slug: string) => {
    const product = productsBySlug[slug];
    if (user) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setItems(data.items || []);
      } catch (e) { toast(e instanceof Error ? e.message : 'Could not add', true); return; }
    } else {
      const map = readGuest();
      const stock = product?.stock ?? 99;
      map[slug] = clampQty((map[slug] || 0) + 1, stock);
      writeGuest(map);
      setItems(guestLines(map));
    }
    if (product) toast(`Added · ${product.name}`);
    setOpen(true);
  }, [user, productsBySlug, guestLines, toast]);

  const setQty = useCallback(async (productId: string, qty: number) => {
    if (user) {
      const res = await fetch('/api/cart', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: qty }),
      });
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
    } else {
      const slug = productsById[productId]?.slug;
      if (!slug) return;
      const map = readGuest();
      if (qty <= 0) delete map[slug];
      else map[slug] = clampQty(qty, productsById[productId]?.stock ?? 99);
      writeGuest(map);
      setItems(guestLines(map));
    }
  }, [user, productsById, guestLines]);

  const remove = useCallback((productId: string) => setQty(productId, 0), [setQty]);

  const totals = useMemo(() => computeTotals(items), [items]);
  const count = useMemo(() => items.reduce((s, l) => s + l.quantity, 0), [items]);

  const value: CartContextValue = {
    items, totals, count, open, setOpen, add, setQty, remove, toast, toasts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
