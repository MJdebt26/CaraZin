import { Router } from 'express';
import { db } from '../lib/db.js';

const router = Router();

function publicProduct(p) {
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

// GET /api/products  (active only, public)
router.get('/', (req, res) => {
  const { category } = req.query;
  let rows;
  if (category) {
    rows = db.prepare('SELECT * FROM products WHERE active = 1 AND category = ? ORDER BY sort, id').all(category);
  } else {
    rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY sort, id').all();
  }
  res.json(rows.map(publicProduct));
});

// GET /api/products/:slug
router.get('/:slug', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE slug = ? AND active = 1').get(req.params.slug);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(publicProduct(p));
});

export default router;
