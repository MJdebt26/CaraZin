import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { seed } from './lib/db.js';
import productsRouter from './routes/products.js';
import checkoutRouter from './routes/checkout.js';
import newsletterRouter from './routes/newsletter.js';
import adminRouter from './routes/admin.js';
import webhookHandler from './routes/webhook.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Ensure schema + seed data exist before serving.
seed();

const app = express();
app.disable('x-powered-by');

// Stripe webhook needs the raw body — must be registered BEFORE express.json().
app.post('/api/webhook', express.raw({ type: 'application/json' }), webhookHandler);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// API routes
app.use('/api/products', productsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/admin', adminRouter);
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Static storefront + admin
app.use(express.static(PUBLIC_DIR));

// Error handler (JSON)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  CaraZin store running → http://localhost:${PORT}`);
  console.log(`  Admin dashboard       → http://localhost:${PORT}/admin.html\n`);
});
