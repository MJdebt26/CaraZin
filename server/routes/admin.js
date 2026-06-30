import { Router } from 'express';
import { db } from '../lib/db.js';
import { checkPassword, issueSession, clearSession, requireAdmin, isAuthed } from '../lib/auth.js';
import { getOrder, updateStatus } from '../lib/orders.js';

const router = Router();

// ── Auth ──
router.post('/login', (req, res) => {
  if (!checkPassword(req.body?.password)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  issueSession(res);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

router.get('/session', (req, res) => {
  res.json({ authed: isAuthed(req) });
});

// Everything below requires admin auth.
router.use(requireAdmin);

// ── Dashboard stats ──
router.get('/stats', (req, res) => {
  const revenue = db.prepare(`SELECT COALESCE(SUM(total_cents),0) c FROM orders WHERE status IN ('paid','fulfilled','shipped')`).get().c;
  const orders = db.prepare('SELECT COUNT(*) c FROM orders').get().c;
  const paid = db.prepare(`SELECT COUNT(*) c FROM orders WHERE status != 'pending'`).get().c;
  const subscribers = db.prepare('SELECT COUNT(*) c FROM newsletter').get().c;
  const products = db.prepare('SELECT COUNT(*) c FROM products WHERE active = 1').get().c;
  res.json({
    revenue: revenue / 100,
    orders,
    paidOrders: paid,
    subscribers,
    products,
  });
});

// ── Products CRUD ──
router.get('/products', (req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY sort, id').all());
});

router.post('/products', (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.slug || b.price_cents == null) {
    return res.status(400).json({ error: 'name, slug and price_cents are required' });
  }
  try {
    const info = db.prepare(`
      INSERT INTO products (slug, name, description, price_cents, category, badge, fitment, image, stock, active, sort)
      VALUES (@slug,@name,@description,@price_cents,@category,@badge,@fitment,@image,@stock,@active,@sort)
    `).run({
      slug: b.slug,
      name: b.name,
      description: b.description || '',
      price_cents: Math.round(Number(b.price_cents)),
      category: b.category || 'accessories',
      badge: b.badge || null,
      fitment: b.fitment || null,
      image: b.image || '',
      stock: b.stock != null ? Number(b.stock) : 100,
      active: b.active === false ? 0 : 1,
      sort: Number(b.sort) || 0,
    });
    res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/products/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const merged = {
    slug: b.slug ?? existing.slug,
    name: b.name ?? existing.name,
    description: b.description ?? existing.description,
    price_cents: b.price_cents != null ? Math.round(Number(b.price_cents)) : existing.price_cents,
    category: b.category ?? existing.category,
    badge: b.badge !== undefined ? b.badge : existing.badge,
    fitment: b.fitment !== undefined ? b.fitment : existing.fitment,
    image: b.image ?? existing.image,
    stock: b.stock != null ? Number(b.stock) : existing.stock,
    active: b.active != null ? (b.active ? 1 : 0) : existing.active,
    sort: b.sort != null ? Number(b.sort) : existing.sort,
    id: existing.id,
  };
  try {
    db.prepare(`
      UPDATE products SET slug=@slug, name=@name, description=@description, price_cents=@price_cents,
        category=@category, badge=@badge, fitment=@fitment, image=@image, stock=@stock, active=@active, sort=@sort
      WHERE id=@id
    `).run(merged);
    res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(existing.id));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Orders ──
router.get('/orders', (req, res) => {
  const { status } = req.query;
  const rows = status
    ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/orders/:id', (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

router.put('/orders/:id/status', (req, res) => {
  try {
    updateStatus(req.params.id, req.body?.status);
    res.json(getOrder(req.params.id));
  } catch (e) {
    res.status(e.status || 400).json({ error: e.message });
  }
});

// ── Newsletter subscribers ──
router.get('/subscribers', (req, res) => {
  res.json(db.prepare('SELECT * FROM newsletter ORDER BY created_at DESC').all());
});

export default router;
