import { Router } from 'express';
import { priceCart, CURRENCY } from '../lib/cart.js';
import { createPendingOrder, attachStripeSession, markPaid, getOrderPublic } from '../lib/orders.js';
import { stripe, stripeEnabled } from '../lib/stripe.js';

const router = Router();

function validEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function baseUrl(req) {
  return process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
}

// POST /api/checkout  { items:[{id,qty}], customer:{email,name,...} }
router.post('/', async (req, res, next) => {
  try {
    const { items, customer = {} } = req.body || {};
    if (!validEmail(customer.email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }
    const priced = priceCart(items);
    const orderId = createPendingOrder({ priced, customer });

    // ── MOCK mode: no Stripe key configured ──
    if (!stripeEnabled) {
      markPaid(orderId, 'mock_pi_' + orderId);
      return res.json({
        mode: 'mock',
        orderId,
        url: `${baseUrl(req)}/success.html?order=${orderId}`,
      });
    }

    // ── Real Stripe Checkout (test or live, depending on key) ──
    const line_items = priced.lines.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: CURRENCY,
        unit_amount: l.price_cents,
        product_data: { name: l.name },
      },
    }));

    const shipping_options = [{
      shipping_rate_data: {
        type: 'fixed_amount',
        display_name: priced.shipping_cents === 0 ? 'Free shipping' : 'Standard shipping',
        fixed_amount: { amount: priced.shipping_cents, currency: CURRENCY },
      },
    }];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customer.email,
      line_items,
      shipping_options,
      client_reference_id: orderId,
      metadata: { orderId },
      success_url: `${baseUrl(req)}/success.html?order=${orderId}`,
      cancel_url: `${baseUrl(req)}/?checkout=cancelled`,
    });

    attachStripeSession(orderId, session.id);
    res.json({ mode: 'stripe', orderId, url: session.url });
  } catch (err) {
    next(err);
  }
});

// GET /api/checkout/order/:id — public confirmation view (non-PII)
router.get('/order/:id', (req, res) => {
  const order = getOrderPublic(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

export default router;
