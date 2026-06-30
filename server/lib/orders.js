import crypto from 'node:crypto';
import { db, transaction } from './db.js';

export function newOrderId() {
  // Short, human-friendly, unguessable order id e.g. CZ-7F3A9C
  return 'CZ-' + crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
}

export function createPendingOrder({ priced, customer }) {
  const id = newOrderId();
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, email, customer_name, phone, address_line1, address_line2,
      city, province, postal_code, country, subtotal_cents, shipping_cents, total_cents,
      currency, status)
    VALUES (@id, @email, @customer_name, @phone, @address_line1, @address_line2,
      @city, @province, @postal_code, @country, @subtotal_cents, @shipping_cents, @total_cents,
      @currency, 'pending')
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, name, price_cents, qty)
    VALUES (?, ?, ?, ?, ?)
  `);
  transaction(() => {
    insertOrder.run({
      id,
      email: customer.email,
      customer_name: customer.name || null,
      phone: customer.phone || null,
      address_line1: customer.address_line1 || null,
      address_line2: customer.address_line2 || null,
      city: customer.city || null,
      province: customer.province || null,
      postal_code: customer.postal_code || null,
      country: customer.country || 'CA',
      subtotal_cents: priced.subtotal_cents,
      shipping_cents: priced.shipping_cents,
      total_cents: priced.total_cents,
      currency: priced.currency,
    });
    for (const l of priced.lines) {
      insertItem.run(id, l.product_id, l.name, l.price_cents, l.qty);
    }
  });
  return id;
}

export function attachStripeSession(orderId, sessionId) {
  db.prepare('UPDATE orders SET stripe_session_id = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(sessionId, orderId);
}

export function markPaid(orderId, paymentIntent) {
  transaction(() => {
    const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(orderId);
    if (!order || order.status === 'paid') return;
    db.prepare(`UPDATE orders SET status = 'paid', stripe_payment_intent = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(paymentIntent || null, orderId);
    // decrement stock
    const items = db.prepare('SELECT product_id, qty FROM order_items WHERE order_id = ?').all(orderId);
    const dec = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');
    for (const it of items) if (it.product_id) dec.run(it.qty, it.product_id);
  });
}

export function getOrder(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  return { ...order, items };
}

// Limited, non-PII view for the public confirmation page.
export function getOrderPublic(orderId) {
  const o = getOrder(orderId);
  if (!o) return null;
  return {
    id: o.id,
    status: o.status,
    currency: o.currency,
    subtotal: o.subtotal_cents / 100,
    shipping: o.shipping_cents / 100,
    total: o.total_cents / 100,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price_cents / 100 })),
  };
}

export function updateStatus(orderId, status) {
  const allowed = ['pending', 'paid', 'fulfilled', 'shipped', 'cancelled', 'refunded'];
  if (!allowed.includes(status)) {
    const err = new Error('Invalid status');
    err.status = 400;
    throw err;
  }
  db.prepare('UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, orderId);
}
