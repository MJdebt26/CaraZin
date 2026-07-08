'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initStorefront } from '@/lib/storefront-init';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';

export default function StoreClient() {
  const { user, openAuth } = useAuth();
  const { add, count, setOpen } = useCart();
  const router = useRouter();

  // Mark the landing page so global `cursor:none` (for the custom BMW cursor)
  // applies only here — the standalone shop/account pages use a normal cursor.
  // Also mount the fixed "key light" spotlight + stage vignette layers.
  useEffect(() => {
    document.body.classList.add('landing');
    const vig = document.createElement('div'); vig.id = 'cz-vignette';
    const spot = document.createElement('div'); spot.id = 'cz-spot';
    document.body.appendChild(vig); document.body.appendChild(spot);
    return () => {
      document.body.classList.remove('landing');
      vig.remove(); spot.remove();
    };
  }, []);

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
    const doAuth = () => openAuth();
    cartBtn?.addEventListener('click', openCart);
    authBtn?.addEventListener('click', doAuth);
    return () => {
      cartBtn?.removeEventListener('click', openCart);
      authBtn?.removeEventListener('click', doAuth);
    };
  }, [setOpen, openAuth]);

  // Make each landing product/key card clickable → its detail page. The slug
  // comes from the card's [data-add] element; clicks on the add button itself
  // still add to cart (handled above), so we ignore those.
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.p-card, .k-card'));
    const handlers = cards.map((card) => {
      const slug = card.querySelector<HTMLElement>('[data-add]')?.dataset.add;
      const handler = (e: Event) => {
        if (!slug) return;
        if ((e.target as HTMLElement).closest('[data-add]')) return; // add-to-cart button
        router.push(`/shop/${slug}`);
      };
      // NB: don't set cursor:pointer here — the landing keeps its custom BMW
      // cursor (which already scales on hover); an inline pointer would override it.
      card.addEventListener('click', handler);
      return { card, handler };
    });
    return () => handlers.forEach(({ card, handler }) => card.removeEventListener('click', handler));
  }, [router]);

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

  return null;
}
