'use client';

import { useEffect, useState } from 'react';
import { initStorefront } from '@/lib/storefront-init';
import { useAuth } from './AuthProvider';
import AuthModal from './AuthModal';

export default function StoreClient() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  // Run the ported storefront behaviour once on mount.
  useEffect(() => {
    initStorefront();

    // Temporary "+ → ✓" feedback on add buttons (real cart comes in Phase 2)
    const addBtns = Array.from(document.querySelectorAll<HTMLElement>('.add-btn'));
    const addHandlers = addBtns.map((btn) => {
      const handler = () => {
        const original = btn.textContent;
        btn.textContent = '✓';
        btn.style.background = 'var(--black)'; btn.style.color = 'var(--white)'; btn.style.borderColor = 'var(--black)';
        setTimeout(() => {
          btn.textContent = original; btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = '';
        }, 1800);
      };
      btn.addEventListener('click', handler);
      return { btn, handler };
    });

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

    return () => {
      addHandlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
      nlb?.removeEventListener('click', nlHandler);
    };
  }, []);

  // Wire the nav Sign In / Account button (lives in injected static markup).
  useEffect(() => {
    const btn = document.querySelector<HTMLElement>('[data-auth-toggle]');
    if (!btn) return;
    const open = () => setAuthOpen(true);
    btn.addEventListener('click', open);
    return () => btn.removeEventListener('click', open);
  }, []);

  // Reflect auth state in the nav button label.
  useEffect(() => {
    const btn = document.querySelector<HTMLElement>('[data-auth-toggle]');
    if (btn) btn.textContent = user ? 'Account' : 'Sign In';
  }, [user]);

  return <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />;
}
