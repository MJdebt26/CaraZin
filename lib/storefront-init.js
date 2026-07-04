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
  });

  (function loop() {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Cursor invert on dark sections
  const darkEls = document.querySelectorAll('.feat-cnt,.keys-section,.nl-wrap,footer,.mbar,.hero,.zoom-section');
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

  gsap.to('#hero-img', { yPercent: 15, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  const zoomTl = gsap.timeline({
    scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 1.8 },
  });
  zoomTl
    .to('#zoom-car', { scale: 2.2, filter: 'brightness(0.3) contrast(1.1)', ease: 'power1.inOut', duration: .45 }, 0)
    .to('#zoom-ext', { opacity: 0, duration: .12, ease: 'power1.in' }, .38)
    .to('#zoom-int', { opacity: 1, duration: .14, ease: 'power1.out' }, .42)
    .fromTo('#zoom-interior',
      { scale: 1.2, filter: 'brightness(0.5) contrast(1.05)' },
      { scale: 1.0, filter: 'brightness(0.85) contrast(1.05)', duration: .4, ease: 'power1.out' }, .42)
    .to('#zoom-interior', { scale: 1.08, duration: .35, ease: 'power1.inOut' }, .72);

  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 22 }, {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  gsap.to('.feat-img img', { yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.feature-split', start: 'top bottom', end: 'bottom top', scrub: true } });

  // ── CINEMATIC SEQUENCE (#cine) ──
  // Beats: "Details Matter" → "Inside" (gold) → interior shot → "And Out"
  // (gold/black on light) → exterior shot → fade out & unpin.
  const cine = document.getElementById('cine');
  if (cine) {
    const mm = gsap.matchMedia();

    // Desktop: pinned via sticky, layers crossfade on a single scrub timeline.
    mm.add('(min-width: 768px)', () => {
      gsap.set('#cine .cine-layer', { opacity: 0 });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '#cine', start: 'top top', end: 'bottom bottom', scrub: 1 },
      });
      tl.to('.cine-details', { opacity: 1, duration: 8 }, 2)          // a. fade in
        .to('.cine-details', { opacity: 0, duration: 6 }, 18)         // a. fade out
        .to('.cine-inside-t', { opacity: 1, duration: 8 }, 24)        // b. "Inside" (gold) in
        .to('.cine-inside-t', { opacity: 0, duration: 6 }, 40)        // c. out
        .fromTo('.cine-inside', { opacity: 0, scale: 1.08 },          // c. interior crossfade in
          { opacity: 1, scale: 1.0, duration: 10 }, 40)
        .to('.cine-inside', { opacity: 1, duration: 10 }, 52)         //    hold full-bleed
        .to('.cine-inside', { opacity: 0, duration: 8 }, 62)          // d. out
        .fromTo('.cine-andout', { opacity: 0 },                       // d. "And Out" (light) in
          { opacity: 1, duration: 8 }, 62)
        .to('.cine-andout', { opacity: 1, duration: 8 }, 72)          //    hold
        .to('.cine-andout', { opacity: 0, duration: 8 }, 82)          // e. out
        .fromTo('.cine-outside', { opacity: 0, scale: 1.06 },         // e. exterior crossfade in
          { opacity: 1, scale: 1.0, duration: 8 }, 82)
        .to('.cine-outside', { opacity: 1, duration: 8 }, 92)         //    hold
        .to('.cine-outside', { opacity: 0, duration: 6 }, 100);       // f. out → unpin
    });

    // Mobile: scroll-jacking is janky on touch — fall back to simple sequential
    // fades (no pin, no scrub) as each layer enters the viewport.
    mm.add('(max-width: 767px)', () => {
      gsap.utils.toArray('#cine .cine-layer').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play none none reverse' },
        });
      });
    });
  }
}
