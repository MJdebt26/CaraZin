// Storefront behaviour ported verbatim from the original inline <script>
// (custom cursor, nav light/dark, GSAP scroll animations, reveals).
// Runs once on the client after the injected markup is in the DOM.
// GSAP + ScrollTrigger are loaded globally via <Script> in app/layout.tsx.
//
// NOTE: the original "add to cart" and "newsletter" handlers are intentionally
// omitted here — those are owned by React (CartDrawer / newsletter signup).

export function initStorefront() {
  if (typeof window === 'undefined') return;
  if (window.__czStoreInit) return; // guard against React strict-mode double run
  window.__czStoreInit = true;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // ── BMW CURSOR ──────────────────────────────────────
  const cur = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');
  if (!cur || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0, isDark = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    // Feed the cursor "key light" — the spotlight layer tracks these vars.
    document.body.style.setProperty('--mx', mx + 'px');
    document.body.style.setProperty('--my', my + 'px');
  });

  (function loop() {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Cursor invert on dark sections
  const darkEls = document.querySelectorAll('.feat-cnt,.keys-section,.nl-wrap,footer,.mbar,.hero');
  function updateCursorColor() {
    let onDark = false;
    darkEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (my > r.top && my < r.bottom && mx > r.left && mx < r.right) onDark = true;
    });
    if (onDark !== isDark) {
      isDark = onDark;
      const swap = onDark ? '#f5f4f0' : '#0a0a0a';
      // Gold quadrants (.cur-gold) stay constant as the brand accent; the neutral
      // quadrants (.cur-swap) and rings (.cur-stroke) invert so the roundel stays
      // legible over both light and dark sections.
      cur.querySelectorAll('.cur-swap').forEach((p) => p.setAttribute('fill', swap));
      cur.querySelectorAll('.cur-stroke').forEach((c) => c.setAttribute('stroke', swap));
      ring.style.borderColor = onDark ? 'rgba(245,244,240,0.22)' : 'rgba(10,10,10,0.18)';
    }
  }
  document.addEventListener('mousemove', updateCursorColor);

  // Cursor scale on hover
  document.querySelectorAll('a,button,.p-card,.k-card,.feat-item,.wi').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cur.style.transform = 'translate(-50%,-50%) scale(1.5)';
      ring.style.width = '52px'; ring.style.height = '52px'; ring.style.opacity = '.4';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '1';
    });
  });

  // ── MAGNETIC BUTTONS (desktop pointer, motion-OK only) ──
  const fineNoMotion = window.matchMedia('(pointer:fine)').matches
    && window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (fineNoMotion && gsap) {
    document.querySelectorAll('.btn-primary, .add-btn, .nav-shop, .k-add').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3' });
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.42);
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  // ── NAV LIGHT/DARK ─────────────────────────────────
  const nav = document.getElementById('nav');
  const lightSections = document.querySelectorAll('.products-wrap,.panel-split,.puddle-split,.cp-split,.rev-section,.why-wrap');
  function updateNav() {
    let onLight = false;
    lightSections.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top <= 80 && r.bottom >= 80) onLight = true;
    });
    nav.classList.toggle('light', onLight);
  }
  window.addEventListener('scroll', updateNav);

  // ── GSAP ────────────────────────────────────────────
  if (!gsap) { console.warn('[storefront] GSAP not loaded'); return; }
  gsap.registerPlugin(ScrollTrigger);

  const htl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  htl.to('#htag', { opacity: 1, y: 0, duration: .8, delay: .3 })
    .to('#hh1', { opacity: 1, y: 0, duration: 1.0 }, '-=.5')
    .to('#hsub', { opacity: 1, y: 0, duration: .8 }, '-=.6')
    .to('#hcta', { opacity: 1, y: 0, duration: .7 }, '-=.5')
    .to('#sc', { opacity: 1, duration: .5 }, '-=.3');

  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 22 }, {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  gsap.to('.feat-img img', { yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.feature-split', start: 'top bottom', end: 'bottom top', scrub: true } });

  // ── "DETAILS MATTER" SCROLL SEQUENCE (built on the hero, #dm-stage) ──
  // Beats: the real headline #hh1 scales up + centres → "Inside" (gold) →
  // interior shot → "And Out" (gold/black on light) → exterior shot → fade out.
  const stage = document.getElementById('dm-stage');
  if (stage) {
    const mm = gsap.matchMedia();

    // Desktop: pin the stage, scrub one timeline through the beats.
    mm.add('(min-width: 768px)', () => {
      gsap.set('#dm-stage .hero-seq', { opacity: 0 });
      // Shrink the headline box to its text so centring the box centres the text
      // (no visible change at rest — the text stays where it is).
      const hh1 = document.getElementById('hh1');
      gsap.set('#hh1', { width: 'max-content', maxWidth: 'none', transformOrigin: 'center center' });
      // Deltas to move #hh1 from its bottom-left flow spot to viewport centre.
      // Computed ONCE here (page at top, hero freshly laid out) using offset*
      // values — computing them lazily inside the scrub tween is unreliable
      // because ScrollTrigger's pin-refresh transiently shifts offsetTop.
      const dx = window.innerWidth / 2 - (hh1.offsetLeft + hh1.offsetWidth / 2);
      const dy = window.innerHeight / 2 - (hh1.offsetTop + hh1.offsetHeight / 2);

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '#dm-stage', start: 'top top', end: '+=650%',
          pin: true, scrub: 1,
        },
      });
      // a. headline grows + moves to centre; hero chrome + bg fade away.
      // overwrite:'auto' lets the scroll timeline cleanly take these props over
      // from the on-load entrance timeline (which also animates #hh1 + chrome).
      tl.to('#hh1', { x: dx, y: dy, scale: 1.85, duration: 14, ease: 'power2.inOut', overwrite: 'auto' }, 0)
        .to(['#htag', '#hsub', '#hcta', '#sc'], { opacity: 0, duration: 6, overwrite: 'auto' }, 0)
        .to('.hero-bg', { opacity: 0, duration: 10 }, 2)
        .to('#hh1', { opacity: 0, duration: 6 }, 16)                        // a → out
        .fromTo('.hs-inside', { opacity: 0 }, { opacity: 1, duration: 8 }, 18)  // b. Inside (gold)
        .to('.hs-inside', { opacity: 0, duration: 6 }, 32)                 // c. out
        .fromTo('.hs-interior', { opacity: 0, scale: 1.08 },               // c. interior crossfade
          { opacity: 1, scale: 1.0, duration: 10 }, 32)
        .to('.hs-interior', { opacity: 1, duration: 10 }, 44)              //    hold full-bleed
        .to('.hs-interior', { opacity: 0, duration: 8 }, 54)              // d. out
        .fromTo('.hs-andout', { opacity: 0 }, { opacity: 1, duration: 8 }, 54)  // d. And Out (light)
        .to('.hs-andout', { opacity: 1, duration: 8 }, 64)                //    hold
        .to('.hs-andout', { opacity: 0, duration: 8 }, 74)               // e. out
        .fromTo('.hs-exterior', { opacity: 0, scale: 1.06 },              // e. exterior crossfade
          { opacity: 1, scale: 1.0, duration: 8 }, 74)
        .to('.hs-exterior', { opacity: 1, duration: 8 }, 84)             //    hold
        .to('.hs-exterior', { opacity: 0, duration: 6 }, 92);           // f. out → unpin
    });

    // Mobile: scroll-jacking is janky on touch — no pin/scrub. Hero stays normal;
    // the beats fade in sequentially as full-height panels below it.
    mm.add('(max-width: 767px)', () => {
      gsap.utils.toArray('#dm-stage .hero-seq').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play none none reverse' },
        });
      });
    });
  }
}
