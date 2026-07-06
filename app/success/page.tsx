import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';
import ClearCartOnSuccess from '@/components/ClearCartOnSuccess';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = { title: 'Order Confirmed · CARAZIN', robots: { index: false } };

const money = (cents: number) => '$' + (cents / 100).toFixed(2);

type OrderItem = { name: string; price_cents: number; quantity: number };
type Order = {
  id: string; email: string; status: string;
  subtotal_cents: number; shipping_cents: number; total_cents: number;
};

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  let order: Order | null = null;
  let items: OrderItem[] = [];
  if (session_id) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.from('orders').select('*').eq('stripe_session_id', session_id).maybeSingle();
      order = (data as Order) ?? null;
      if (order) {
        const { data: oi } = await admin.from('order_items').select('name, price_cents, quantity').eq('order_id', order.id);
        items = (oi as OrderItem[]) ?? [];
      }
    } catch { /* fall through to the generic thank-you */ }
  }

  const ref = order ? order.id.slice(0, 8).toUpperCase() : null;

  return (
    <div className="site-page">
      <ClearCartOnSuccess />
      <AnnouncementBar />
      <SiteHeader />
      <main className="success-main">
        <div className="success-mark" aria-hidden="true">
          <svg viewBox="0 0 52 52" width="52" height="52"><path d="M14 27l8 8 16-18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="sec-eyebrow">Order confirmed</div>
        <h1 className="success-title">Thank you — you noticed the details.</h1>
        <p className="success-lead">
          {order
            ? <>We&apos;ve received your order and a confirmation is on its way to <strong>{order.email}</strong>. Your parcel ships from Vancouver, tracked door to door.</>
            : <>We&apos;ve received your order and a confirmation email is on its way. Your parcel ships from Vancouver, tracked door to door.</>}
        </p>

        {order && (
          <div className="success-card">
            <div className="success-card-head">
              <div>
                <div className="success-ref-label">Order</div>
                <div className="success-ref">#{ref}</div>
              </div>
              <div className={`success-status ${order.status === 'paid' ? 'paid' : 'pending'}`}>
                {order.status === 'paid' ? 'Paid' : 'Processing'}
              </div>
            </div>

            {items.length > 0 && (
              <div className="success-items">
                {items.map((it, i) => (
                  <div className="success-item" key={i}>
                    <span className="success-item-name">{it.name} <span className="success-item-qty">× {it.quantity}</span></span>
                    <span className="success-item-price">{money(it.price_cents * it.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="success-totals">
              <div className="success-row"><span>Subtotal</span><span>{money(order.subtotal_cents)}</span></div>
              <div className="success-row"><span>Shipping</span><span>{order.shipping_cents === 0 ? 'Free' : money(order.shipping_cents)}</span></div>
              <div className="success-row total"><span>Total</span><span>{money(order.total_cents)} CAD</span></div>
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link href="/shop" className="success-btn">Continue shopping</Link>
          <Link href="/account" className="success-btn ghost">View my orders</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
