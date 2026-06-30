-- CaraZin schema: products, cart_items, orders, order_items
-- Run in the Supabase SQL editor (or `supabase db push`).

-- ─── PRODUCTS ───────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  category    text not null default 'accessories',
  badge       text,
  fitment     text,
  image       text not null default '',
  stock       integer not null default 100,
  active      boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── CART ITEMS (one row per user+product) ──────────────────
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity   integer not null check (quantity > 0),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists idx_cart_items_user on public.cart_items(user_id);

-- ─── ORDERS ─────────────────────────────────────────────────
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete set null, -- null = guest
  email                 text not null,
  status                text not null default 'pending'
                          check (status in ('pending','paid','fulfilled','shipped','cancelled','refunded')),
  subtotal_cents        integer not null default 0,
  shipping_cents        integer not null default 0,
  total_cents           integer not null default 0,
  currency              text not null default 'cad',
  stripe_session_id     text,
  stripe_payment_intent text,
  shipping_address      jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_session on public.orders(stripe_session_id);

-- ─── ORDER ITEMS ────────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  price_cents integer not null,
  quantity    integer not null check (quantity > 0)
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table public.products    enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Products: world-readable; writes only via service role (which bypasses RLS).
drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products
  for select using (true);

-- Cart items: each user manages only their own rows.
drop policy if exists "cart_select" on public.cart_items;
create policy "cart_select" on public.cart_items
  for select using (auth.uid() = user_id);
drop policy if exists "cart_insert" on public.cart_items;
create policy "cart_insert" on public.cart_items
  for insert with check (auth.uid() = user_id);
drop policy if exists "cart_update" on public.cart_items;
create policy "cart_update" on public.cart_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "cart_delete" on public.cart_items;
create policy "cart_delete" on public.cart_items
  for delete using (auth.uid() = user_id);

-- Orders: each user can read only their own. Inserts/updates happen server-side
-- via the service-role key (bypasses RLS), so no write policy is granted here.
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
  for select using (auth.uid() = user_id);

-- Order items: readable when the parent order belongs to the user.
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
