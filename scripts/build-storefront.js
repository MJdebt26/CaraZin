/**
 * Transforms the hand-built storefront (storefront-original.html) into the
 * served public/index.html by tagging each "buy" trigger with a
 * data-add="<productId>" attribute and injecting the cart assets.
 *
 * Product ids match the seed order in server/lib/db.js (sort 0..N => id 1..N).
 *
 * Run: npm run build:storefront
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'storefront-original.html');
const OUT = path.join(ROOT, 'public', 'index.html');

let html = fs.readFileSync(SRC, 'utf8');

// ── 1. The 8 product-grid buttons, in document order → ids 1..8 ──
let n = 0;
html = html.replace(/<button class="add-btn">\+<\/button>/g, () => {
  n += 1;
  return `<button class="add-btn" data-add="${n}" aria-label="Add to cart">+</button>`;
});
if (n !== 8) console.warn(`[build] expected 8 grid buttons, tagged ${n}`);

// ── 2. Feature-section CTA anchors → their primary product ──
const ctaMap = [
  [/<a href="#" class="btn-primary">Shop Taillights<\/a>/, 8],
  [/<a href="#" class="btn-primary">Shop Panels<\/a>/, 4],
  [/<a href="#" class="btn-primary">Order Yours<\/a>/, 6],
  [/<a href="#" class="btn-primary">Shop Adapter[^<]*<\/a>/, 3],
];
for (const [re, id] of ctaMap) {
  if (!re.test(html)) console.warn(`[build] CTA not found: ${re}`);
  html = html.replace(re, (m) => m.replace('<a href="#"', `<a href="#cart" data-add="${id}"`));
}

// ── 3. Key cards: inject an "Add to cart" button after each price ──
//    BMW $129.99 → 7 · Mercedes $139.99 → 10 · Universal fob $99.99 → 5
const keyMap = { '129.99': 7, '139.99': 10, '99.99': 5 };
html = html.replace(/<div class="k-price">\$(\d+\.\d{2})<\/div>/g, (m, price) => {
  const id = keyMap[price];
  if (!id) return m;
  return `${m}\n      <button class="k-add" data-add="${id}">Add to cart</button>`;
});

// ── 4. Taillight feature rows (unique fi-name) → ids 8 / 9 ──
html = html
  .replace(/<div class="fi-name">CSL Laser Style Taillights → M3 G80<\/div>/,
    '<div class="fi-name" data-add="8" role="button" tabindex="0">CSL Laser Style Taillights → M3 G80</div>')
  .replace(/<div class="fi-name">CSL Laser Style Taillights → 3 Series G20<\/div>/,
    '<div class="fi-name" data-add="9" role="button" tabindex="0">CSL Laser Style Taillights → 3 Series G20</div>');

// ── 5. Nav: turn "Order Now" into the cart toggle ──
html = html.replace(
  /<a href="#nl" class="nav-shop">Order Now<\/a>/,
  '<button class="nav-shop" id="cart-toggle" data-cart-toggle>Cart · <span id="cart-count">0</span></button>'
);

// ── 6. Inject store assets into <head> ──
html = html.replace('</head>',
  '  <link rel="stylesheet" href="/store.css">\n</head>');

// ── 7. Inject cart script before </body> ──
html = html.replace('</body>',
  '<script src="/cart.js"></script>\n</body>');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`[build] wrote ${OUT} (${(html.length / 1024).toFixed(0)} KB)`);
