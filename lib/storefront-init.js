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
      const fills = cur.querySelectorAll('path');
      fills.forEach((p, i) => {
        if (onDark) {
          if (p.getAttribute('fill') === '#0a0a0a') p.setAttribute('fill', '#f5f4f0');
          else if (p.getAttribute('fill') === 'white' || p.getAttribute('fill') === '#f5f4f0') p.setAttribute('fill', '#0a0a0a');
        } else {
          if (p.getAttribute('fill') === '#f5f4f0') p.setAttribute('fill', '#0a0a0a');
          else if (p.getAttribute('fill') === '#0a0a0a' && i >= 2) p.setAttribute('fill', 'white');
        }
      });
      cur.querySelectorAll('circle').forEach((c) => c.setAttribute('stroke', onDark ? '#f5f4f0' : '#0a0a0a'));
      ring.style.borderColor = onDark ? 'rgba(245,244,240,0.22)' : 'rgba(10,10,10,0.18)';
    }
  }
  document.addEventListener('mousemove', updateCursorColor);

  // Cursor scale on hover
  document.querySelectorAll('a,button,.p-card,.k-card,.feat-item,.wi').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cur.style.transform = 'translate(-50%,-50%) scale(1.5)';
      ring.style.width = '70px'; ring.style.height = '70px'; ring.style.opacity = '.4';
    });
    el.addEventListener('mouseleave', () => {
      cur.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.width = '50px'; ring.style.height = '50px'; ring.style.opacity = '1';
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
}
