'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

export default function AddToCart({ slug, inStock, max = 20 }: { slug: string; inStock: boolean; max?: number }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  async function onAdd() {
    setBusy(true);
    await add(slug, qty);
    setBusy(false);
  }

  if (!inStock) {
    return <button className="pdp-add" disabled>Sold out</button>;
  }

  return (
    <div className="pdp-buy">
      <div className="pdp-qty">
        <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
        <span>{qty}</span>
        <button aria-label="Increase" onClick={() => setQty((q) => Math.min(max, q + 1))}>+</button>
      </div>
      <button className="pdp-add" onClick={onAdd} disabled={busy}>
        {busy ? 'Adding…' : 'Add to Cart'}
      </button>
    </div>
  );
}
