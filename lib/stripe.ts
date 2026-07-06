import 'server-only';
import Stripe from 'stripe';

// Server-only Stripe client. Returns null when STRIPE_SECRET_KEY isn't set so
// the app degrades gracefully (the checkout endpoint reports "not configured"
// instead of crashing) and starts working the moment the key is added.
let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}

export const stripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;
