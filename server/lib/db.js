import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'carazin.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// node:sqlite has no better-sqlite3-style db.transaction() helper, so provide one.
// Runs `fn` inside BEGIN/COMMIT, rolling back on any error.
export function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_cents INTEGER NOT NULL,
      category    TEXT NOT NULL DEFAULT 'accessories',
      badge       TEXT,
      fitment     TEXT,
      image       TEXT NOT NULL DEFAULT '',
      stock       INTEGER NOT NULL DEFAULT 100,
      active      INTEGER NOT NULL DEFAULT 1,
      sort        INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id                 TEXT PRIMARY KEY,
      email              TEXT NOT NULL,
      customer_name      TEXT,
      phone              TEXT,
      address_line1      TEXT,
      address_line2      TEXT,
      city               TEXT,
      province           TEXT,
      postal_code        TEXT,
      country            TEXT DEFAULT 'CA',
      subtotal_cents     INTEGER NOT NULL DEFAULT 0,
      shipping_cents     INTEGER NOT NULL DEFAULT 0,
      total_cents        INTEGER NOT NULL DEFAULT 0,
      currency           TEXT NOT NULL DEFAULT 'cad',
      status             TEXT NOT NULL DEFAULT 'pending',
      stripe_session_id  TEXT,
      stripe_payment_intent TEXT,
      created_at         TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id  INTEGER,
      name        TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      qty         INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
  `);
}

// Catalog mirrors the products shown in the storefront. Order/sort matches the
// product grid in index.html so the build script can map cards -> ids by position.
export const SEED_PRODUCTS = [
  { slug: 'ambient-strip-kit', name: 'Interior Ambient Strip Kit', price_cents: 3899, category: 'lighting', badge: 'Hot',
    fitment: 'Universal', description: '16M colour, app + music sync. 5-min peel-and-stick install, any car.' },
  { slug: 'radar-detector', name: 'Long-Range Radar Detector', price_cents: 7999, category: 'electronics', badge: 'Bestseller',
    fitment: 'Universal', description: '360° detection, GPS auto-learn, OLED display. All Canadian bands.' },
  { slug: 'wireless-carplay', name: 'Wireless CarPlay + Android Auto', price_cents: 5999, category: 'connectivity', badge: 'Top Pick',
    fitment: 'Any wired OEM system', description: 'One dongle converts any wired OEM system. Pair once, auto-connects every drive.' },
  { slug: 'ambient-door-panel', name: 'OEM Ambient Light Door Panel', price_cents: 24999, category: 'lighting', badge: 'Upgrade',
    fitment: 'BMW · Audi · Mercedes', description: 'Full replacement panel with integrated gradient LED. Looks completely factory-fitted.' },
  { slug: 'smart-display-fob', name: 'Universal Smart Display Fob', price_cents: 9999, category: 'keys', badge: 'New',
    fitment: 'Any OEM remote', description: 'Internal module swap for any OEM remote. OLED touchscreen, custom logo engraving.' },
  { slug: 'puddle-projectors', name: 'Animated Puddle Light Projectors', price_cents: 6499, category: 'lighting', badge: 'New',
    fitment: 'Universal · per pair', description: 'AMG One, M Power, Porsche or custom moving logo projection on ground.' },
  { slug: 'bmw-display-key', name: 'BMW OLED Display Key', price_cents: 12999, category: 'keys', badge: 'Premium',
    fitment: 'G20 / G80 / G82', description: 'G20 / G80 / G82 series. Live screen shows lock status, battery, animations.' },
  { slug: 'm4cs-taillights', name: 'M4 CS Style Taillights', price_cents: 69999, category: 'exterior', badge: 'Exclusive',
    fitment: 'M3 G80 / 3 Series G20', description: 'CSL laser-look sequential taillights for M3 G80 / 3 Series G20. Plug & play.' },
  // Feature-section variants (referenced by the storefront feature blocks)
  { slug: 'taillights-g20', name: 'CSL Laser Style Taillights — 3 Series G20', price_cents: 64999, category: 'exterior', badge: null,
    fitment: '3 Series G20', description: 'Matching CSL look, full LED, direct fit for the 3 Series G20.' },
  { slug: 'mercedes-display-key', name: 'Mercedes Display Smart Key', price_cents: 13999, category: 'keys', badge: null,
    fitment: 'C / E / S / GLE class', description: 'Touchscreen fob with ambient-matched LED ring. C / E / S / GLE class.' },
];

export function seed() {
  migrate();
  const exists = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  if (exists > 0) {
    console.log(`Seed skipped — ${exists} products already present.`);
    return;
  }
  const insert = db.prepare(`
    INSERT INTO products (slug, name, description, price_cents, category, badge, fitment, image, stock, active, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?, '', 100, 1, ?)
  `);
  SEED_PRODUCTS.forEach((p, i) => {
    insert.run(p.slug, p.name, p.description, p.price_cents, p.category, p.badge, p.fitment, i);
  });
  console.log(`Seeded ${SEED_PRODUCTS.length} products into ${DB_PATH}`);
}

// Run directly: `node server/lib/db.js --seed`
if (process.argv[1] && process.argv[1].endsWith('db.js')) {
  if (process.argv.includes('--seed')) seed();
  else migrate();
}
