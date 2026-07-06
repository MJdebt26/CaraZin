import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';
import { loadCart } from '@/lib/cart-server';
import { computeTotals, clampQty, toPublicProduct, CURRENCY, type Product, type CartLine } from '@/lib/cart';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  // Identify the shopper (optional — guests can check out too).
  const supabase = await createClient();
  let userId: string | null = null;
  let userEmail: string | null = null;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { userId = user.id; userEmail = user.email ?? null; }
  }

  // Build cart lines with server-trusted prices (never the client's numbers).
  let lines: CartLine[] = [];
  if (userId && supabase) {
    lines = (await loadCart(supabase, userId)).items;
  } else {
    const body = (await req.json().catch(() => ({}))) as { items?: { slug: string; qty: number }[] };
    const raw: { slug: string; qty: number }[] = Array.isArray(body.items) ? body.items : [];
    if (raw.length) {
      const admin = createAdminClient();
      const { data } = await admin.from('products').select('*').in('slug', raw.map((i) => i.slug)).eq('active', true);
      const bySlug: Record<string, Product> = {};
      (data as Product[] ?? []).forEach((p) => { bySlug[p.slug] = p; });
      lines = raw
        .map((i) => {
          const p = bySlug[i.slug];
          if (!p || p.stock <= 0) return null;
          return { product: toPublicProduct(p), quantity: clampQty(i.qty, p.stock) };
        })
        .filter((l): l is CartLine => !!l && l.quantity > 0);
    }
  }

  if (!lines.length) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  const totals = computeTotals(lines);

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Checkout isn’t live yet — add a Stripe key to enable payments.' },
      { status: 503 },
    );
  }

  // Persist a pending order (service role bypasses RLS).
  const admin = createAdminClient();
  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      user_id: userId,
      email: userEmail ?? 'guest@carazin.ca',
      status: 'pending',
      subtotal_cents: totals.subtotal_cents,
      shipping_cents: totals.shipping_cents,
      total_cents: totals.total_cents,
      currency: CURRENCY,
    })
    .select('id')
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }

  await admin.from('order_items').insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.product.id,
      name: l.product.name,
      price_cents: l.product.price_cents,
      quantity: l.quantity,
    })),
  );

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: CURRENCY,
        unit_amount: l.product.price_cents,
        product_data: {
          name: l.product.name,
          ...(l.product.fitment ? { description: l.product.fitment } : {}),
        },
      },
    })),
    ...(totals.shipping_cents > 0
      ? {
          shipping_options: [
            {
              shipping_rate_data: {
                type: 'fixed_amount' as const,
                fixed_amount: { amount: totals.shipping_cents, currency: CURRENCY },
                display_name: 'Standard shipping',
              },
            },
          ],
        }
      : {}),
    ...(userEmail ? { customer_email: userEmail } : {}),
    success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/shop`,
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
  });

  await admin
    .from('orders')
    .update({ stripe_session_id: session.id, updated_at: new Date().toISOString() })
    .eq('id', order.id);

  return NextResponse.json({ url: session.url });
}
