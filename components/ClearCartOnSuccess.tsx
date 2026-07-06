'use client';

import { useEffect } from 'react';
import { useCart } from './CartProvider';

// Runs on the order-confirmation page: empties the client cart view once the
// purchase is complete (the DB cart is already cleared by the Stripe webhook).
export default function ClearCartOnSuccess() {
  const { clear } = useCart();
  useEffect(() => { clear(); }, [clear]);
  return null;
}
