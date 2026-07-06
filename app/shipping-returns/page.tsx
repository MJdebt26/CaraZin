import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';

export const metadata: Metadata = {
  title: 'Shipping & Returns · CARAZIN',
  description:
    'How Carazin ships across Canada and the US, delivery timelines, and our 30-day return policy.',
};

const SHIPPING = [
  { region: 'Metro Vancouver', time: '2–3 business days', cost: 'Free over $150 · $9.99 flat' },
  { region: 'Rest of British Columbia', time: '3–5 business days', cost: 'Free over $150 · $9.99 flat' },
  { region: 'Across Canada', time: '4–8 business days', cost: 'Free over $150 · calculated at checkout' },
  { region: 'United States', time: '6–10 business days', cost: 'Calculated at checkout · duties prepaid' },
];

export default function ShippingReturnsPage() {
  return (
    <div className="site-page">
      <AnnouncementBar />
      <SiteHeader />
      <main className="info-main">
        <header className="info-hero">
          <div className="sec-eyebrow">Logistics</div>
          <h1 className="info-title">Shipping &amp; Returns</h1>
          <p className="info-lead">
            Everything ships from our Vancouver warehouse, tracked door to door. Free shipping kicks
            in automatically on orders over $150.
          </p>
        </header>

        <section className="info-section">
          <h2 className="info-h2">Delivery timelines</h2>
          <div className="ship-table">
            <div className="ship-row ship-head">
              <span>Region</span><span>Estimated time</span><span>Cost</span>
            </div>
            {SHIPPING.map((s) => (
              <div className="ship-row" key={s.region}>
                <span>{s.region}</span><span>{s.time}</span><span>{s.cost}</span>
              </div>
            ))}
          </div>
          <p className="info-note">
            Orders placed before 1:00 PM PT on a business day are dispatched the same day. You&apos;ll
            receive a tracking link by email the moment your parcel leaves the warehouse.
          </p>
        </section>

        <section className="info-section">
          <h2 className="info-h2">30-day returns</h2>
          <div className="info-body">
            <p>
              Changed your mind? Send it back within 30 days of delivery for a full refund. Items
              should be unused and in their original packaging. Electronics that have been paired or
              installed can still be returned if they&apos;re defective — we cover the return label
              in that case.
            </p>
            <p>
              To start a return, email <a href="mailto:hello@carazin.ca">hello@carazin.ca</a> with
              your order number. We&apos;ll reply within one business day with a prepaid label and
              instructions. Refunds land back on your original payment method within 5–7 business
              days of us receiving the item.
            </p>
          </div>
        </section>

        <section className="info-section">
          <h2 className="info-h2">Warranty</h2>
          <div className="info-body">
            <p>
              Every product carries a minimum 12-month warranty against manufacturing defects.
              Lighting and exterior components carry a 24-month warranty. If something fails in
              normal use, we replace it — no fuss.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
