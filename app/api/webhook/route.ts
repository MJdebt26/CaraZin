import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// Stripe → CaraZin webhook. Verifies the signature, then on a completed
// checkout marks the order paid, decrements stock, and clears the buyer's cart.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? '', secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid signature';
    return NextResponse.json({ error: `Webhook signature verification failed: ${msg}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const admin = createAdminClient();

      await admin
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          ...(session.customer_details?.email ? { email: session.customer_details.email } : {}),
          ...(session.customer_details?.address ? { shipping_address: session.customer_details.address } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Decrement stock for each line (best-effort; small catalogue).
      const { data: items } = await admin.from('order_items').select('product_id, quantity').eq('order_id', orderId);
      for (const it of items ?? []) {
        if (!it.product_id) continue;
        const { data: prod } = await admin.from('products').select('stock').eq('id', it.product_id).single();
        if (prod) {
          await admin.from('products').update({ stock: Math.max(0, prod.stock - it.quantity) }).eq('id', it.product_id);
        }
      }

      // Clear the buyer's persistent cart.
      const { data: order } = await admin.from('orders').select('user_id').eq('id', orderId).single();
      if (order?.user_id) {
        await admin.from('cart_items').delete().eq('user_id', order.user_id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
