/* CaraZin storefront cart + checkout (vanilla JS, no build step). */
(function () {
  'use strict';

  const LS_KEY = 'carazin_cart_v1';
  const FREE_SHIP = 15000;   // cents — keep in sync with server/lib/cart.js
  const FLAT_SHIP = 999;

  let PRODUCTS = {};         // id -> product
  let cart = load();         // { [id]: qty }
  let view = 'cart';         // 'cart' | 'checkout'

  // ── Storage ──
  function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch { return {}; }
  }
  function save() { localStorage.setItem(LS_KEY, JSON.stringify(cart)); }

  // ── Money ──
  const money = (cents) => '$' + (cents / 100).toFixed(2);

  // ── Data ──
  async function loadProducts() {
    const res = await fetch('/api/products');
    const list = await res.json();
    PRODUCTS = {};
    list.forEach((p) => { PRODUCTS[p.id] = p; });
  }

  // ── Cart ops ──
  function count() { return Object.values(cart).reduce((s, q) => s + q, 0); }
  function addToCart(id, qty = 1) {
    id = Number(id);
    if (!PRODUCTS[id]) return;
    cart[id] = Math.min(20, (cart[id] || 0) + qty);
    save(); syncCount();
    toast(`Added · ${PRODUCTS[id].name}`);
  }
  function setQty(id, qty) {
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(20, qty);
    save(); syncCount(); render();
  }
  function totals() {
    let subtotal = 0;
    for (const [id, qty] of Object.entries(cart)) {
      const p = PRODUCTS[id];
      if (p) subtotal += p.price_cents * qty;
    }
    const shipping = subtotal === 0 || subtotal >= FREE_SHIP ? 0 : FLAT_SHIP;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  // ── UI scaffolding ──
  function syncCount() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = count();
  }

  let overlay, drawer;
  function buildDrawer() {
    overlay = document.createElement('div');
    overlay.id = 'cz-overlay';
    overlay.addEventListener('click', closeDrawer);

    drawer = document.createElement('aside');
    drawer.id = 'cz-drawer';
    drawer.setAttribute('aria-label', 'Shopping cart');
    drawer.addEventListener('click', (e) => e.stopPropagation());

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    const toasts = document.createElement('div');
    toasts.id = 'cz-toasts';
    document.body.appendChild(toasts);
  }

  function openDrawer() { view = 'cart'; render(); overlay.classList.add('open'); drawer.classList.add('open'); }
  function closeDrawer() { overlay.classList.remove('open'); drawer.classList.remove('open'); }

  function render() {
    if (view === 'checkout') return renderCheckout();
    renderCart();
  }

  function renderCart() {
    const ids = Object.keys(cart);
    const { subtotal, shipping, total } = totals();

    let items = '';
    if (ids.length === 0) {
      items = `<div class="cz-empty">Your cart is empty.<br>Add something worth noticing.</div>`;
    } else {
      items = ids.map((id) => {
        const p = PRODUCTS[id];
        if (!p) return '';
        const qty = cart[id];
        return `
          <div class="cz-item" data-id="${id}">
            <div class="cz-item-info">
              <div class="cz-item-name">${esc(p.name)}</div>
              ${p.fitment ? `<div class="cz-item-fit">${esc(p.fitment)}</div>` : ''}
              <div class="cz-item-bottom">
                <div class="cz-qty">
                  <button data-dec="${id}" aria-label="Decrease">−</button>
                  <span>${qty}</span>
                  <button data-inc="${id}" aria-label="Increase">+</button>
                </div>
                <div class="cz-item-price">${money(p.price_cents * qty)}</div>
              </div>
              <button class="cz-remove" data-rm="${id}">Remove</button>
            </div>
          </div>`;
      }).join('');
    }

    const shipNote = subtotal > 0 && subtotal < FREE_SHIP
      ? `<div class="cz-ship-note">Add ${money(FREE_SHIP - subtotal)} for free shipping</div>` : '';

    drawer.innerHTML = `
      <div class="cz-head"><h3>Cart · ${count()}</h3><button class="cz-close" aria-label="Close">×</button></div>
      <div class="cz-body">${items}</div>
      ${ids.length ? `
      <div class="cz-foot">
        <div class="cz-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="cz-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : money(shipping)}</span></div>
        ${shipNote}
        <div class="cz-row total"><span>Total</span><span>${money(total)}</span></div>
        <button class="cz-btn" id="cz-checkout">Checkout</button>
      </div>` : ''}
    `;

    drawer.querySelector('.cz-close').addEventListener('click', closeDrawer);
    drawer.querySelectorAll('[data-inc]').forEach((b) => b.onclick = () => setQty(b.dataset.inc, cart[b.dataset.inc] + 1));
    drawer.querySelectorAll('[data-dec]').forEach((b) => b.onclick = () => setQty(b.dataset.dec, cart[b.dataset.dec] - 1));
    drawer.querySelectorAll('[data-rm]').forEach((b) => b.onclick = () => setQty(b.dataset.rm, 0));
    const co = drawer.querySelector('#cz-checkout');
    if (co) co.onclick = () => { view = 'checkout'; render(); };
  }

  function renderCheckout() {
    const { subtotal, shipping, total } = totals();
    drawer.innerHTML = `
      <div class="cz-head"><h3>Checkout</h3><button class="cz-close" aria-label="Close">×</button></div>
      <div class="cz-body">
        <button class="cz-back" id="cz-back">← Back to cart</button>
        <form class="cz-form" id="cz-form" novalidate>
          <div class="full">
            <label>Email *</label>
            <input class="cz-input" name="email" type="email" required placeholder="you@example.com">
          </div>
          <div class="full">
            <label>Full name</label>
            <input class="cz-input" name="name" placeholder="Alex Driver">
          </div>
          <div class="full">
            <label>Address</label>
            <input class="cz-input" name="address_line1" placeholder="Street address">
          </div>
          <div>
            <label>City</label>
            <input class="cz-input" name="city" placeholder="Vancouver">
          </div>
          <div>
            <label>Province</label>
            <input class="cz-input" name="province" placeholder="BC">
          </div>
          <div>
            <label>Postal code</label>
            <input class="cz-input" name="postal_code" placeholder="V6B 1A1">
          </div>
          <div>
            <label>Phone</label>
            <input class="cz-input" name="phone" placeholder="(optional)">
          </div>
          <div class="cz-err full" id="cz-err"></div>
        </form>
      </div>
      <div class="cz-foot">
        <div class="cz-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="cz-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : money(shipping)}</span></div>
        <div class="cz-row total"><span>Total</span><span>${money(total)}</span></div>
        <button class="cz-btn" id="cz-pay">Pay ${money(total)}</button>
      </div>
    `;
    drawer.querySelector('.cz-close').addEventListener('click', closeDrawer);
    drawer.querySelector('#cz-back').onclick = () => { view = 'cart'; render(); };
    drawer.querySelector('#cz-pay').onclick = submitCheckout;
  }

  async function submitCheckout() {
    const form = document.getElementById('cz-form');
    const errEl = document.getElementById('cz-err');
    const payBtn = document.getElementById('cz-pay');
    const data = Object.fromEntries(new FormData(form).entries());

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) {
      errEl.textContent = 'Please enter a valid email address.';
      return;
    }
    errEl.textContent = '';
    payBtn.disabled = true;
    payBtn.textContent = 'Redirecting…';

    const items = Object.entries(cart).map(([id, qty]) => ({ id: Number(id), qty }));
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer: data }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Checkout failed');
      // Order placed — clear cart and go to Stripe (or mock success page).
      cart = {}; save(); syncCount();
      window.location.href = out.url;
    } catch (e) {
      errEl.textContent = e.message;
      payBtn.disabled = false;
      payBtn.textContent = 'Try again';
    }
  }

  // ── Toast ──
  let toastTimer;
  function toast(msg, isErr) {
    const wrap = document.getElementById('cz-toasts');
    if (!wrap) return;
    const t = document.createElement('div');
    t.className = 'cz-toast' + (isErr ? ' err' : '');
    t.textContent = msg;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 2400);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  // ── Wiring ──
  function wire() {
    // Cart toggle in nav
    document.querySelectorAll('[data-cart-toggle]').forEach((el) =>
      el.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); }));

    // Any add-to-cart trigger
    document.querySelectorAll('[data-add]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(el.dataset.add);
        openDrawer();
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addToCart(el.dataset.add); openDrawer(); }
      });
    });

    // Newsletter → real signup
    const nlb = document.getElementById('nlb');
    const nle = document.getElementById('nle');
    if (nlb && nle) {
      nlb.addEventListener('click', async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nle.value)) return;
        try {
          await fetch('/api/newsletter', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: nle.value }),
          });
          toast('Subscribed — welcome to CaraZin');
        } catch { /* the original handler already shows ✓ */ }
      });
    }

    // Returning from a cancelled Stripe checkout
    if (new URLSearchParams(location.search).get('checkout') === 'cancelled') {
      toast('Checkout cancelled — your cart is saved', true);
      history.replaceState({}, '', location.pathname);
    }
  }

  // ── Init ──
  async function init() {
    buildDrawer();
    await loadProducts();
    // Drop any cart entries whose product no longer exists.
    for (const id of Object.keys(cart)) if (!PRODUCTS[id]) delete cart[id];
    save();
    syncCount();
    wire();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
