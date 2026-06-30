import { stripe } from '../lib/stripe.js';
import { markPaid } from '../lib/orders.js';

// Mounted with express.raw() so req.body is a Buffer for signature verification.
export default function webhookHandler(req, res) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (secret && sig && stripe) {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } else {
      // No webhook secret configured (e.g. local dev without `stripe listen`).
      // Parse without verification so manual testing still works.
      event = JSON.parse(req.body.toString());
      console.warn('[webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification.');
    }
  } catch (err) {
    console.error('[webhook] signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId || session.client_reference_id;
      if (orderId) markPaid(orderId, session.payment_intent);
      console.log(`[webhook] order ${orderId} marked paid`);
      break;
    }
    default:
      break;
  }
  res.json({ received: true });
}
