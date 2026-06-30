# CaraZin — Premium Automotive Accessories Store

A full e-commerce web store built on top of the original CaraZin landing page.
Vanilla front-end (the original hand-built design, untouched visually) wired to a
real Node.js backend: product catalog, persistent cart, Stripe checkout, order
management, newsletter signups, and a password-protected admin dashboard.

> The original single-page site is preserved in `storefront-original.html`. The
> served storefront (`public/index.html`) is generated from it by a small build
> step that wires every "add to cart" button to the backend — the design is
> identical.

## Stack

- **Server:** Node.js + Express
- **Database:** SQLite via Node's built-in `node:sqlite` (no native build, no external DB)
- **Payments:** Stripe Checkout (test or live) with a built-in **mock mode** so the store runs with zero configuration
- **Front-end:** vanilla HTML/CSS/JS (no framework, no build tooling beyond one Node script)

## Quick start

```bash
npm install
npm run build:storefront   # generates public/index.html from the original design
npm start                  # http://localhost:3000
```

That's it. With no `.env` the store runs in **mock checkout mode** (orders are
created and marked paid without charging a card) and the admin password is `admin`.

- Storefront → http://localhost:3000
- Admin dashboard → http://localhost:3000/admin.html  (password: `admin`)

## Configuration

Copy `.env.example` to `.env` and fill in what you need:

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (default 3000) |
| `PUBLIC_URL` | Externally reachable base URL — required in production so Stripe redirects back correctly |
| `ADMIN_PASSWORD` | Password for the admin dashboard |
| `SESSION_SECRET` | Long random string used to sign the admin session cookie |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` / `sk_live_…`). **Leave blank for mock mode.** |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for confirming payments |

### Enabling real Stripe checkout (test mode)

1. Create a free account at https://stripe.com and grab your **test** keys from
   https://dashboard.stripe.com/test/apikeys.
2. Put the secret key in `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   ```
3. Forward webhooks to your local server (Stripe CLI):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   Copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET` in `.env`, then
   restart the server.
4. Check out using a Stripe test card, e.g. `4242 4242 4242 4242`, any future
   expiry, any CVC. Orders are marked **paid** when Stripe confirms via webhook.

Going live is the same with `sk_live_…` keys and a webhook endpoint configured
in the Stripe Dashboard pointing at `https://your-domain/api/webhook`.

## How it works

```
storefront-original.html ──(scripts/build-storefront.js)──▶ public/index.html
                                                              + public/cart.js  (cart drawer, checkout)
                                                              + public/store.css

Browser ──▶ /api/products            list catalog
        ──▶ /api/checkout            validate cart server-side, create order, start Stripe session
        ──▶ /api/webhook             Stripe confirms payment → order marked paid, stock decremented
        ──▶ /api/newsletter          email signups
        ──▶ /api/admin/*             auth-gated product + order management
```

**Prices are never trusted from the client.** The cart sends only product ids and
quantities; the server (`server/lib/cart.js`) recomputes every price, shipping,
and total from the database.

Shipping: flat **$9.99 CAD**, free over **$150**. Change in `server/lib/cart.js`.

## API reference

Public:
- `GET /api/products` — active catalog (`?category=` to filter)
- `GET /api/products/:slug` — single product
- `POST /api/checkout` — `{ items:[{id,qty}], customer:{email,...} }` → `{ url }` (redirect target)
- `GET /api/checkout/order/:id` — non-PII confirmation view
- `POST /api/newsletter` — `{ email }`
- `POST /api/webhook` — Stripe events (raw body)

Admin (cookie session via `POST /api/admin/login`):
- `GET /api/admin/stats`
- `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/:id`
- `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PUT /api/admin/orders/:id/status`
- `GET /api/admin/subscribers`

## Admin dashboard

`/admin.html` — log in with `ADMIN_PASSWORD`. Tabs:
- **Orders** — view every order, line items, shipping address, and change status
  (pending → paid → fulfilled → shipped → cancelled → refunded).
- **Products** — create, edit, delete; set price, stock, category, badge, visibility.
- **Subscribers** — newsletter signups.

## Editing the catalog

Seed data lives in `server/lib/db.js` (`SEED_PRODUCTS`) and is inserted on first
run. After that, manage products from the admin dashboard. To re-seed from
scratch, delete `data/carazin.db*` and restart.

If you add/remove/reorder products such that the storefront card → id mapping
changes, update `scripts/build-storefront.js` and re-run `npm run build:storefront`.

## Project layout

```
server/
  index.js            Express app + route wiring
  lib/
    db.js             SQLite connection, schema, seed, transaction helper
    cart.js           server-side price/shipping calculation
    orders.js         order persistence (create, mark paid, status)
    stripe.js         Stripe client (or mock-mode flag)
    auth.js           admin session cookies
  routes/
    products.js  checkout.js  webhook.js  newsletter.js  admin.js
public/
  index.html          generated storefront (do not hand-edit — edit the original)
  cart.js  store.css  success.html  admin.html
storefront-original.html   the original hand-built design (source of truth for layout)
scripts/build-storefront.js
data/                 SQLite database (gitignored)
```

## Deployment

This is a **stateful** app (SQLite on disk), so pick a host with a persistent
filesystem:

- **Render / Railway / Fly.io / a VPS** — set the env vars, run `npm install && npm start`,
  attach a persistent volume for `data/`. Point `PUBLIC_URL` at your domain and
  add the Stripe webhook endpoint.
- **Vercel** (where the original static site lived) is *not* recommended as-is:
  its serverless filesystem is ephemeral, so the SQLite database would reset. To
  use Vercel you'd swap `node:sqlite` for a hosted database (e.g. Postgres/Turso)
  in `server/lib/db.js`.

Always set a strong `ADMIN_PASSWORD` and `SESSION_SECRET` in production.
```
