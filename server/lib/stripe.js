import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

export const stripeEnabled = !!key;
export const stripe = key ? new Stripe(key) : null;

if (!stripeEnabled) {
  console.warn(
    '[stripe] STRIPE_SECRET_KEY not set — running in MOCK checkout mode. ' +
    'Orders will be created and marked paid without a real payment. ' +
    'Add your Stripe test key to .env to enable real Stripe Checkout.'
  );
}
