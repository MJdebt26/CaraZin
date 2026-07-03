'use client';

import { useCart } from './CartProvider';
import {
  FREE_SHIPPING_THRESHOLD_CENTS as FREE_SHIP,
} from '@/lib/cart';

const money = (cents: number) => '$' + (cents / 100).toFixed(2);

export default function CartDrawer() {
  const { items, totals, count, open, setOpen, setQty, remove, toast, toasts } = useCart();

  const shipNote =
    totals.subtotal_cents > 0 && totals.subtotal_cents < FREE_SHIP
      ? `Add ${money(FREE_SHIP - totals.subtotal_cents)} for free shipping`
      : '';

  return (
    <>
      {/* Toasts */}
      <div id="cz-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={'cz-toast show' + (t.err ? ' err' : '')}>{t.msg}</div>
        ))}
      </div>

      {/* Overlay */}
      <div className={'cz-overlay' + (open ? ' open' : '')} onClick={() => setOpen(false)} />

      {/* Drawer */}
      <aside id="cz-drawer" className={open ? 'open' : ''} aria-label="Shopping cart" aria-hidden={!open}>
        <div className="cz-head">
          <h3>Cart · {count}</h3>
          <button className="cz-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        </div>

        <div className="cz-body">
          {items.length === 0 ? (
            <div className="cz-empty">Your cart is empty.<br />Add something worth noticing.</div>
          ) : (
            items.map(({ product, quantity }) => (
              <div className="cz-item" key={product.id}>
                <div className="cz-item-info">
                  <div className="cz-item-name">{product.name}</div>
                  {product.fitment && <div className="cz-item-fit">{product.fitment}</div>}
                  <div className="cz-item-bottom">
                    <div className="cz-qty">
                      <button aria-label="Decrease" onClick={() => setQty(product.id, quantity - 1)}>−</button>
                      <span>{quantity}</span>
                      <button aria-label="Increase" onClick={() => setQty(product.id, quantity + 1)}>+</button>
                    </div>
                    <div className="cz-item-price">{money(product.price_cents * quantity)}</div>
                  </div>
                  <button className="cz-remove" onClick={() => remove(product.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cz-foot">
            <div className="cz-row"><span>Subtotal</span><span>{money(totals.subtotal_cents)}</span></div>
            <div className="cz-row"><span>Shipping</span><span>{totals.shipping_cents === 0 ? 'Free' : money(totals.shipping_cents)}</span></div>
            {shipNote && <div className="cz-ship-note">{shipNote}</div>}
            <div className="cz-row total"><span>Total</span><span>{money(totals.total_cents)}</span></div>
            <button className="cz-btn" onClick={() => toast('Checkout is added in the next step (Phase 3).')}>
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
