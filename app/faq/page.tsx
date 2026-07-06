import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';

export const metadata: Metadata = {
  title: 'FAQ · CARAZIN',
  description: 'Answers on fitment, installation, shipping, warranty, and payment at Carazin.',
};

const FAQS = [
  {
    q: 'How do I know a product fits my car?',
    a: 'Every listing states the exact chassis it fits (e.g. G20, G80, C-Class). If your model isn’t listed, email us your year, make, model and trim — we’ll confirm before you buy.',
  },
  {
    q: 'Can I install these myself?',
    a: 'Most of our lighting, keys, and CarPlay products are plug-and-play in 15–30 minutes and ship with an illustrated guide. Exterior work like taillights is straightforward but we recommend a shop if you’re not comfortable removing trim.',
  },
  {
    q: 'Are these OEM or aftermarket?',
    a: 'A mix — but everything is chosen to look and perform at OEM grade. Where a part is OEM-sourced we say so; where it’s a premium aftermarket upgrade, we test it on our own cars before listing it.',
  },
  {
    q: 'When will my order arrive?',
    a: 'Metro Vancouver orders arrive in 2–3 business days, the rest of Canada in 4–8. Orders before 1 PM PT ship the same day, and you’ll get a tracking link by email.',
  },
  {
    q: 'What’s your return policy?',
    a: 'Unused items can be returned within 30 days for a full refund. Defective electronics can be returned even after pairing — we cover the return label. See Shipping & Returns for details.',
  },
  {
    q: 'Is checkout secure?',
    a: 'Yes. Payments are processed over an encrypted SSL connection by Stripe, the same processor used by companies like Shopify and Amazon. We never see or store your card number.',
  },
  {
    q: 'Do you offer a warranty?',
    a: 'Every product carries at least a 12-month warranty against defects; lighting and exterior parts carry 24 months. If it fails in normal use, we replace it.',
  },
];

export default function FaqPage() {
  return (
    <div className="site-page">
      <AnnouncementBar />
      <SiteHeader />
      <main className="info-main">
        <header className="info-hero">
          <div className="sec-eyebrow">Support</div>
          <h1 className="info-title">Frequently asked</h1>
          <p className="info-lead">
            Can&apos;t find your answer? Email <a href="mailto:hello@carazin.ca">hello@carazin.ca</a> —
            a real person who&apos;s fitted the part will reply within a business day.
          </p>
        </header>

        <section className="faq-list">
          {FAQS.map((f, i) => (
            <details className="faq-item" key={i} {...(i === 0 ? { open: true } : {})}>
              <summary className="faq-q">
                {f.q}
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <div className="faq-a">{f.a}</div>
            </details>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
