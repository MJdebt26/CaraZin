'use client';

import { useEffect, useState } from 'react';
import { initStorefront } from '@/lib/storefront-init';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import AuthModal from './AuthModal';

export default function StoreClient() {
  const { user } = useAuth();
  const { add, count, setOpen } = useCart();
  const [authOpen, setAuthOpen] = useState(false);

  // Run the ported storefront behaviour once, plus newsletter feedback.
  useEffect(() => {
    initStorefront();

    const nlb = document.getElementById('nlb');
    const nle = document.getElementById('nle') as HTMLInputElement | null;
    const nlHandler = () => {
      if (nle && nle.value.includes('@') && nlb) {
        nlb.textContent = '✓';
        (nlb as HTMLElement).style.background = '#2d5a2d'; (nlb as HTMLElement).style.color = '#f5f4f0';
        nle.value = '';
        setTimeout(() => { nlb.textContent = 'Join'; (nlb as HTMLElement).style.background = ''; (nlb as HTMLElement).style.color = ''; }, 3000);
      }
    };
    nlb?.addEventListener('click', nlHandler);
    return () => nlb?.removeEventListener('click', nlHandler);
  }, []);

  // Wire every [data-add] trigger to the cart. Re-bind when `add` changes
  // (its identity updates on login so guest→user adds route correctly).
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-add]'));
    const handlers = els.map((el) => {
      const slug = el.dataset.add!;
      const handler = (e: Event) => {
        e.preventDefault();
        add(slug);
        // micro-feedback on the round "+" buttons
        if (el.classList.contains('add-btn')) {
          const original = el.textContent;
          el.textContent = '✓';
          el.style.background = 'var(--black)'; el.style.color = 'var(--white)'; el.style.borderColor = 'var(--black)';
          setTimeout(() => { el.textContent = original; el.style.background = ''; el.style.color = ''; el.style.borderColor = ''; }, 1400);
        }
      };
      el.addEventListener('click', handler);
      return { el, handler };
    });
    return () => handlers.forEach(({ el, handler }) => el.removeEventListener('click', handler));
  }, [add]);

  // Wire nav Cart + Sign In buttons (in injected static markup).
  useEffect(() => {
    const cartBtn = document.querySelector<HTMLElement>('[data-cart-toggle]');
    const authBtn = document.querySelector<HTMLElement>('[data-auth-toggle]');
    const openCart = () => setOpen(true);
    const openAuth = () => setAuthOpen(true);
    cartBtn?.addEventListener('click', openCart);
    authBtn?.addEventListener('click', openAuth);
    return () => {
      cartBtn?.removeEventListener('click', openCart);
      authBtn?.removeEventListener('click', openAuth);
    };
  }, [setOpen]);

  // Reflect cart count in the nav badge.
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-cart-count]');
    if (el) el.textContent = String(count);
  }, [count]);

  // Reflect auth state in the nav button label.
  useEffect(() => {
    const btn = document.querySelector<HTMLElement>('[data-auth-toggle]');
    if (btn) btn.textContent = user ? 'Account' : 'Sign In';
  }, [user]);

  return <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />;
}
