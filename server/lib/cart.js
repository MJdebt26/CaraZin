import { db } from './db.js';

export const FREE_SHIPPING_THRESHOLD_CENTS = 15000; // free over $150
export const FLAT_SHIPPING_CENTS = 999;             // $9.99 otherwise
export const CURRENCY = 'cad';
export const MAX_QTY_PER_ITEM = 20;

/**
 * Validate a client cart against the DB and compute authoritative totals.
 * Client may lie about prices — we only trust ids + quantities.
 * @param {Array<{id:number, qty:number}>} items
 * @returns {{ lines, subtotal_cents, shipping_cents, total_cents, currency }}
 */
export function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }
  const getProduct = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1');
  const lines = [];
  for (const raw of items) {
    const id = Number(raw.id);
    let qty = Math.floor(Number(raw.qty));
    if (!Number.isInteger(id) || !Number.isFinite(qty)) {
      const err = new Error('Invalid cart item');
      err.status = 400;
      throw err;
    }
    qty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, qty));
    const p = getProduct.get(id);
    if (!p) {
      const err = new Error(`Product ${id} is unavailable`);
      err.status = 400;
      throw err;
    }
    if (p.stock <= 0) {
      const err = new Error(`${p.name} is out of stock`);
      err.status = 409;
      throw err;
    }
    qty = Math.min(qty, p.stock);
    lines.push({
      product_id: p.id,
      slug: p.slug,
      name: p.name,
      price_cents: p.price_cents,
      qty,
      line_total_cents: p.price_cents * qty,
    });
  }
  const subtotal_cents = lines.reduce((s, l) => s + l.line_total_cents, 0);
  const shipping_cents = subtotal_cents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  return {
    lines,
    subtotal_cents,
    shipping_cents,
    total_cents: subtotal_cents + shipping_cents,
    currency: CURRENCY,
  };
}
