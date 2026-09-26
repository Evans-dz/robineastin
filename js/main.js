/* ============================================================
   Wilderness Escape Rentals — interaction layer
   Motion language: <name it here, and in DESIGN.md §1>
   No JS → static page. Reduced motion → static + UI.
   ============================================================ */
(() => {
  'use strict';

  /* ---- reveal on scroll. The CSS hidden state only applies under
     no-preference, so no-JS and reduced-motion both show the real page. */
  const els = document.querySelectorAll('.reveal');
  if (els.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);          // one-shot: never replay
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    els.forEach(el => {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.setProperty('--reveal-delay',
        `calc(${Math.min(i, 6)} * var(--reveal-stagger))`);
      io.observe(el);
    });
  }

  /* ---- bind CONFIG into the page. Every [data-cfg] gets its text
     from the facts file, so markup never holds a number. */
  if (typeof CONFIG !== 'undefined') {
    const get = p => p.split('.').reduce((o, k) => o?.[k], CONFIG);
    document.querySelectorAll('[data-cfg]').forEach(el => {
      const v = get(el.dataset.cfg);
      if (v == null || v === '') { el.closest('[data-cfg-row]')?.remove(); return; }
      if (el.tagName === 'A') {
        el.href = el.dataset.cfgHref
          ? el.dataset.cfgHref.replace('{}', v)
          : el.href;
      }
      el.textContent = v;
    });
  }
})();
