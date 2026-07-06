import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';

export const metadata: Metadata = {
  title: 'About · CARAZIN',
  description:
    'Carazin is a Vancouver studio for premium automotive accessories — OEM-grade lighting, keys, and exterior for BMW and Mercedes drivers who notice everything.',
};

export default function AboutPage() {
  return (
    <div className="site-page">
      <AnnouncementBar />
      <SiteHeader />
      <main className="info-main">
        <header className="info-hero">
          <div className="sec-eyebrow">Our Story</div>
          <h1 className="info-title">Built for drivers who notice everything.</h1>
          <p className="info-lead">
            Carazin began in a Vancouver garage with a simple frustration: the accessories that
            matched the engineering of a modern BMW or Mercedes were either impossible to find or
            impossible to trust. So we built the shop we wanted to buy from.
          </p>
        </header>

        <div className="info-body">
          <p>
            Every product we carry is chosen the same way — we install it on our own cars first.
            If the fit is off, the light temperature is wrong, or the finish looks a grade below
            factory, it never reaches the catalogue. What&apos;s left is a tight, obsessive
            collection: OEM-grade ambient lighting, display keys, wireless CarPlay, and
            concours-level exterior work.
          </p>
          <p>
            We&apos;re a small team based in Vancouver, BC. We source globally and ship locally —
            most Metro Vancouver orders arrive within two to three days, tracked door to door. When
            you email us, a person who has actually fitted the part writes back.
          </p>
        </div>

        <section className="info-stats">
          <div className="info-stat">
            <div className="info-stat-num">2,400+</div>
            <div className="info-stat-cap">Installs shipped across BC</div>
          </div>
          <div className="info-stat">
            <div className="info-stat-num">4.9<span>/5</span></div>
            <div className="info-stat-cap">Average customer rating</div>
          </div>
          <div className="info-stat">
            <div className="info-stat-num">48h</div>
            <div className="info-stat-cap">Median dispatch time</div>
          </div>
          <div className="info-stat">
            <div className="info-stat-num">30d</div>
            <div className="info-stat-cap">No-questions returns</div>
          </div>
        </section>

        <section className="info-values">
          <div className="info-value">
            <div className="info-value-t">OEM-grade or nothing</div>
            <p>If it doesn&apos;t look and feel like it left the factory that way, we don&apos;t sell it.</p>
          </div>
          <div className="info-value">
            <div className="info-value-t">Fitment-first</div>
            <p>Every listing states exactly which chassis it fits. No guesswork, no returns you didn&apos;t plan for.</p>
          </div>
          <div className="info-value">
            <div className="info-value-t">Local &amp; accountable</div>
            <p>Real people in Vancouver, real support, real returns. Not a dropship storefront.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
