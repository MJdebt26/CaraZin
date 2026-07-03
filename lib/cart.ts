// Shared cart types + pricing. Prices/totals are always computed from the
// database product rows, never trusted from the client.

export const FREE_SHIPPING_THRESHOLD_CENTS = 15000; // free over $150
export const FLAT_SHIPPING_CENTS = 999; // $9.99
export const CURRENCY = 'cad';
export const MAX_QTY = 20;

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  badge: string | null;
  fitment: string | null;
  image: string;
  stock: number;
  active: boolean;
};

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  price_cents: number;
  category: string;
  badge: string | null;
  fitment: string | null;
  image: string;
  stock: number;
  inStock: boolean;
};

export type CartLine = { product: PublicProduct; quantity: number };

export type CartTotals = {
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
};

export function toPublicProduct(p: Product): PublicProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price_cents / 100,
    price_cents: p.price_cents,
    category: p.category,
    badge: p.badge,
    fitment: p.fitment,
    image: p.image,
    stock: p.stock,
    inStock: p.stock > 0,
  };
}

export function clampQty(qty: number, stock = MAX_QTY): number {
  const q = Math.floor(Number(qty));
  if (!Number.isFinite(q)) return 1;
  return Math.max(1, Math.min(MAX_QTY, Math.min(q, stock > 0 ? stock : MAX_QTY)));
}

export function computeTotals(lines: CartLine[]): CartTotals {
  const subtotal_cents = lines.reduce((s, l) => s + l.product.price_cents * l.quantity, 0);
  const shipping_cents =
    subtotal_cents === 0 || subtotal_cents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  return { subtotal_cents, shipping_cents, total_cents: subtotal_cents + shipping_cents, currency: CURRENCY };
}
