'use client';

import { useEffect } from 'react';
import { initStorefront } from '@/lib/storefront-init';

// Phase 0: run the ported storefront behaviour (cursor, nav, GSAP, reveals) and
// give the add-to-cart / newsletter buttons their original visual feedback.
// Real cart, auth, and checkout are layered on in later phases.
export default function StoreClient() {
  useEffect(() => {
    initStorefront();

    // Temporary "+ → ✓" feedback on add buttons (cart wiring comes in Phase 2)
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

    // Newsletter visual feedback
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

  return null;
}
