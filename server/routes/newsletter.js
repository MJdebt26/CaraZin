import { Router } from 'express';
import { db } from '../lib/db.js';

const router = Router();

router.post('/', (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email.' });
  }
  try {
    db.prepare('INSERT OR IGNORE INTO newsletter (email) VALUES (?)').run(email);
  } catch {
    /* ignore */
  }
  res.json({ ok: true });
});

export default router;
