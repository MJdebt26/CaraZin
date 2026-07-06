'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';

// Header for the standalone pages (shop, product, account) that don't carry the
// landing page's injected nav. Wired to the same cart drawer + auth modal.
export default function SiteHeader() {
  const { user, openAuth } = useAuth();
  const { count, setOpen } = useCart();

  return (
    <header className="site-header">
      <Link href="/" className="sh-logo">CARA<span className="logo-zin">ZIN</span></Link>
      <div className="sh-links">
        <Link href="/">Home</Link>
        <Link href="/shop">Shop</Link>
      </div>
      <div className="sh-actions">
        <button className="sh-btn" onClick={() => openAuth()}>{user ? 'Account' : 'Sign In'}</button>
        <button className="sh-btn sh-cart" onClick={() => setOpen(true)}>Cart · {count}</button>
      </div>
    </header>
  );
}
