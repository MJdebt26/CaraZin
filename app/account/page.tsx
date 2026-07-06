import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';
import SignOutButton from '@/components/SignOutButton';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Account · CARAZIN', robots: { index: false } };

const money = (cents: number) => '$' + (cents / 100).toFixed(2);

const STATUS_LABEL: Record<string, string> = {
  pending: 'Processing', paid: 'Paid', fulfilled: 'Fulfilled',
  shipped: 'Shipped', cancelled: 'Cancelled', refunded: 'Refunded',
};

type OrderItem = { name: string; price_cents: number; quantity: number };
type Order = {
  id: string; status: string; total_cents: number; created_at: string;
  order_items: OrderItem[];
};

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect('/');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data } = await supabase
    .from('orders')
    .select('id, status, total_cents, created_at, order_items(name, price_cents, quantity)')
    .order('created_at', { ascending: false });
  const orders = (data as Order[]) ?? [];

  return (
    <div className="site-page">
      <AnnouncementBar />
      <SiteHeader />
      <main className="info-main">
        <header className="account-head">
          <div>
            <div className="sec-eyebrow">Account</div>
            <h1 className="info-title" style={{ marginBottom: '.3rem' }}>Your orders</h1>
            <p className="account-email">Signed in as {user.email}</p>
          </div>
          <SignOutButton />
        </header>

        {orders.length === 0 ? (
          <div className="account-empty">
            <p>No orders yet.</p>
            <Link href="/shop" className="success-btn" style={{ marginTop: '1.4rem' }}>Start shopping</Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((o) => (
              <article className="order-card" key={o.id}>
                <div className="order-card-head">
                  <div>
                    <div className="order-ref">Order #{o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="order-date">
                      {new Date(o.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className={`order-status s-${o.status}`}>{STATUS_LABEL[o.status] || o.status}</div>
                </div>
                <div className="order-items">
                  {o.order_items?.map((it, i) => (
                    <div className="order-item" key={i}>
                      <span>{it.name} <span className="order-item-qty">× {it.quantity}</span></span>
                      <span>{money(it.price_cents * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total"><span>Total</span><span>{money(o.total_cents)} CAD</span></div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
