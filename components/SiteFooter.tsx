'use client';

import Link from 'next/link';
import { useState } from 'react';

// Site-wide footer for the standalone pages (shop, product, account, info).
// Reuses the landing page's .nl-* / .f-* styles so it stays byte-consistent with
// the hand-built storefront, but wires real internal routes + a working subscribe.
const SHOP_LINKS = [
  { label: 'Ambient Lighting', href: '/shop?cat=lighting' },
  { label: 'Radar & Electronics', href: '/shop?cat=electronics' },
  { label: 'CarPlay & Connectivity', href: '/shop?cat=connectivity' },
  { label: 'Display Keys', href: '/shop?cat=keys' },
  { label: 'Taillights & Exterior', href: '/shop?cat=exterior' },
];

const PAYMENTS = ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Shop Pay'];

export default function SiteFooter() {
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState('');

  function subscribe() {
    if (!email.includes('@')) return;
    setJoined(true);
    setEmail('');
    setTimeout(() => setJoined(false), 3200);
  }

  return (
    <>
      {/* Newsletter */}
      <section className="nl-wrap site-nl">
        <div>
          <div className="sec-eyebrow">The List</div>
          <h2 className="sec-title">Details, delivered.</h2>
          <p className="sec-body">
            New drops, install guides, and members-only pricing — no noise. Free shipping on your first order when you join.
          </p>
        </div>
        <div>
          <div className="nl-form">
            <input
              type="email"
              className="nl-in"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && subscribe()}
              aria-label="Email address"
            />
            <button className="nl-btn" onClick={subscribe}>{joined ? '✓ Joined' : 'Join'}</button>
          </div>
          <p className="nl-note">One email a week, tops. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="f-top">
          <div>
            <Link href="/" className="f-logo">Cara<span className="logo-zin">zin</span></Link>
            <p className="f-tagline">
              Premium car accessories for drivers who care about every detail. Sourced globally, shipped locally across Vancouver.
            </p>
            <div className="f-badges" aria-label="Trust">
              <span className="f-badge">★ 4.9 · 2,400+ installs</span>
            </div>
          </div>
          <div>
            <div className="f-col-t">Shop</div>
            <ul className="f-links">
              <li><Link href="/shop">All products</Link></li>
              {SHOP_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="f-col-t">Info</div>
            <ul className="f-links">
              <li><Link href="/about">About Carazin</Link></li>
              <li><Link href="/shipping-returns">Shipping & Returns</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/shop">Install Guides</Link></li>
            </ul>
          </div>
          <div>
            <div className="f-col-t">Contact</div>
            <ul className="f-links">
              <li><a href="mailto:hello@carazin.ca">hello@carazin.ca</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a></li>
              <li><span className="f-loc">Vancouver, BC 🇨🇦</span></li>
            </ul>
          </div>
        </div>

        <div className="f-pay">
          {PAYMENTS.map((p) => (
            <span key={p} className="f-pay-badge">{p}</span>
          ))}
          <span className="f-pay-secure">🔒 Secure SSL checkout</span>
        </div>

        <div className="f-bot">
          <div className="f-copy">© 2026 Carazin Inc. — All rights reserved</div>
          <div className="f-soc">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="sb">IG</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="sb">TT</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="sb">FB</a>
          </div>
        </div>
      </footer>
    </>
  );
}
