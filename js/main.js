/* ============================================================
   Wilderness Escape Rentals · interaction layer
   Motion language: CANOPY DESCENT (DESIGN.md §1). Things land
   from above: section heads and cards (.reveal), map pins, and
   the "Zoom to the cabins" control. Nowhere else.
   The HTML is generated complete by tools/build.mjs, so no JS
   means a finished, readable page; this file only adds behaviour.
   ============================================================ */
(() => {
  'use strict';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  /* ---- landing reveals: one-shot, from above. The hidden state only
     applies under no-preference, so reduced motion shows the real page. */
  const els = document.querySelectorAll('.reveal');
  if (els.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);          // one-shot: never replay
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    els.forEach(el => {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.setProperty('--reveal-delay',
        `calc(${Math.min(i, 5)} * var(--reveal-stagger))`);
      io.observe(el);
    });
  }

  /* ---- OwnerRez widgets --------------------------------------------
     OwnerRez serves its widgets to any real domain but refuses localhost
     (403), which would leave empty boxes in local dev. Load widget.js
     everywhere except there; locally, say plainly what loads here. */
  const orMeta = document.querySelector('meta[name="ownerrez"]');
  if (orMeta) {
    const blocked = (orMeta.dataset.blocked || '').split(' ');
    if (location.protocol.startsWith('http') && !blocked.includes(location.hostname)) {
      const s = document.createElement('script');
      s.src = orMeta.content;
      document.body.append(s);
    } else {
      document.querySelectorAll('.or-widget').forEach(w => {
        const type = (w.querySelector('.ownerrez-widget') || {}).dataset?.widgetType || '';
        const name = { 'Booking/Inquiry': 'booking form', 'Reviews': 'guest reviews' }[type] || 'availability calendar';
        w.classList.add('or-widget--preview');
        w.innerHTML = `<p>The live ${name} from OwnerRez loads here on the published site (OwnerRez blocks it on localhost).</p>`;
      });
    }
  }

  /* ---- mobile menu -------------------------------------------------- */
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const open = menuBtn.getAttribute('aria-expanded') !== 'true';
      menuBtn.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  /* ---- season switch: filters [data-seasons] cards in place ---------- */
  const switches = document.querySelectorAll('[data-season-switch]');
  const applySeason = season => {
    document.querySelectorAll('[data-season-switch] button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.season === season)));
    document.querySelectorAll('[data-seasons]').forEach(card => {
      card.hidden = season !== 'all' && !card.dataset.seasons.split(' ').includes(season);
    });
    document.querySelectorAll('[data-season-note]').forEach(n => {
      n.hidden = n.dataset.seasonNote !== season;
    });
    /* a chapter with nothing in season says so, rather than showing a hole */
    document.querySelectorAll('[data-season-scope]').forEach(scope => {
      const cards = scope.querySelectorAll('[data-seasons]');
      const empty = scope.querySelector('.empty-season');
      if (empty) empty.hidden = !cards.length || [...cards].some(c => !c.hidden);
    });
    store.set('we-season', season);
    if (switches.length) {                    /* URL reflects the filter, shareable */
      const u = new URL(location.href);
      season === 'all' ? u.searchParams.delete('season') : u.searchParams.set('season', season);
      history.replaceState(null, '', u);
    }
  };
  if (switches.length) {
    switches.forEach(sw => sw.addEventListener('click', e => {
      const b = e.target.closest('button[data-season]');
      if (b) applySeason(b.dataset.season);
    }));
    const saved = new URL(location.href).searchParams.get('season') || store.get('we-season');
    const first = switches[0].querySelector('button[aria-pressed="true"]');
    applySeason(saved && switches[0].querySelector(`[data-season="${saved}"]`) ? saved
      : first ? first.dataset.season : 'all');
  }

  /* ---- reviews: filter by cabin (no JS: every review shows) ---------- */
  const revFilter = document.querySelector('[data-review-filter]');
  if (revFilter) {
    const showCabin = cabin => {
      const b = revFilter.querySelector(`button[data-cabin="${cabin}"]`) || revFilter.querySelector('button[data-cabin="all"]');
      revFilter.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      document.querySelectorAll('.review-card[data-cabin]').forEach(card => {
        card.hidden = b.dataset.cabin !== 'all' && card.dataset.cabin !== b.dataset.cabin;
      });
      const u = new URL(location.href);                /* shareable, like the season filter */
      b.dataset.cabin === 'all' ? u.searchParams.delete('cabin') : u.searchParams.set('cabin', b.dataset.cabin);
      history.replaceState(null, '', u);
    };
    revFilter.hidden = false;
    revFilter.addEventListener('click', e => {
      const b = e.target.closest('button[data-cabin]');
      if (b) showCabin(b.dataset.cabin);
    });
    const wanted = new URL(location.href).searchParams.get('cabin');
    if (wanted) showCabin(wanted);
  }

  /* ---- photo viewer: every gallery photo opens large, with previous and
     next. No JS (or no <dialog>): the link opens the large photo itself.
     No motion here on purpose; the descent stays the only language. */
  const groups = new Map();
  document.querySelectorAll('a[data-lightbox]').forEach(a => {
    const g = a.dataset.lightbox;
    groups.set(g, [...(groups.get(g) || []), a]);
  });
  if (groups.size && typeof HTMLDialogElement === 'function') {
    const svgIcon = d => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Photo viewer');
    dlg.innerHTML =
      '<figure><img alt=""><figcaption aria-hidden="true"></figcaption></figure>' +
      '<p class="lb-count" aria-live="polite"></p>' +
      `<button class="lb-btn lb-prev" type="button" aria-label="Previous photo">${svgIcon('M15 5l-7 7 7 7')}</button>` +
      `<button class="lb-btn lb-next" type="button" aria-label="Next photo">${svgIcon('M9 5l7 7-7 7')}</button>` +
      `<button class="lb-btn lb-close" type="button" aria-label="Close">${svgIcon('M6 6l12 12M18 6L6 18')}</button>`;
    document.body.append(dlg);
    const img = dlg.querySelector('img');
    const cap = dlg.querySelector('figcaption');
    const count = dlg.querySelector('.lb-count');
    let set = [], at = 0, opener = null;

    const show = n => {
      at = (n + set.length) % set.length;
      const a = set[at];
      img.src = a.href;
      img.alt = a.dataset.caption || '';
      cap.textContent = a.dataset.caption || '';
      count.textContent = `${at + 1} of ${set.length}`;
      /* warm the next photo so stepping through feels instant */
      const next = set[(at + 1) % set.length];
      if (next) new Image().src = next.href;
    };
    groups.forEach(links => links.forEach((a, n) => a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      set = links; opener = a;
      show(n);
      dlg.showModal();
    })));
    dlg.querySelector('.lb-prev').addEventListener('click', () => show(at - 1));
    dlg.querySelector('.lb-next').addEventListener('click', () => show(at + 1));
    dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.tagName === 'FIGURE') dlg.close(); });
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
    });
    let touchX = null;
    dlg.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', e => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
      touchX = null;
    });
    dlg.addEventListener('close', () => { img.removeAttribute('src'); if (opener) opener.focus(); });
  }

  /* ---- print the guide (the pamphlet draft) -------------------------- */
  document.querySelectorAll('[data-print]').forEach(b => {
    b.hidden = false;
    b.addEventListener('click', () => {
      applySeason('all');
      window.print();
    });
  });

  /* ---- the map ------------------------------------------------------- */
  const svg = document.querySelector('.map__svg');
  const dataEl = document.getElementById('map-points');
  if (svg && dataEl) {
    const points = JSON.parse(dataEl.textContent);
    const byId = new Map(points.map(p => [p.id, p]));
    const world = svg.querySelector('.map__world');
    const card = document.getElementById('map-card');
    const pins = [...svg.querySelectorAll('.pin')];
    const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    const show = id => {
      const p = byId.get(id);
      if (!p || !card) return;
      pins.forEach(g => g.setAttribute('aria-pressed', String(g.dataset.id === id)));
      const h = (card.querySelector('h2, h3') || { tagName: 'H3' }).tagName.toLowerCase();
      card.innerHTML =
        `<span class="kind">${esc(p.kindLabel)}</span>` +
        `<${h}>${esc(p.name)}</${h}>` +
        (p.drive ? `<p class="drive">${esc(p.drive)} from the cabins</p>` : '') +
        (p.blurb ? `<p>${esc(p.blurb)}</p>` : '') +
        (p.season ? `<p class="note">Best: ${esc(p.season)}</p>` : '') +
        (p.href ? `<p><a href="${esc(p.href)}">More in the guide</a></p>` : '');
    };
    svg.addEventListener('click', e => {
      const g = e.target.closest('.pin');
      if (g) show(g.dataset.id);
    });
    svg.addEventListener('keydown', e => {
      const g = e.target.closest('.pin');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(g.dataset.id); }
    });
    document.querySelectorAll('[data-show-pin]').forEach(b =>
      b.addEventListener('click', () => {
        show(b.dataset.showPin);
        svg.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }));

    /* category filters */
    const active = new Set([...document.querySelectorAll('.map__filters [aria-pressed="true"]')].map(b => b.dataset.cat));
    document.querySelectorAll('.map__filters .chip').forEach(chip => chip.addEventListener('click', () => {
      const on = chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', String(on));
      on ? active.add(chip.dataset.cat) : active.delete(chip.dataset.cat);
      pins.forEach(g => { if (g.dataset.cat !== 'cabins') g.hidden = !active.has(g.dataset.cat); });
    }));

    /* keep pins and labels a constant screen size (see main.css --u) */
    const vbw = svg.viewBox.baseVal.width;
    const fit = () => {
      const w = svg.getBoundingClientRect().width || vbw;
      svg.style.setProperty('--k', (vbw / w).toFixed(3));
      svg.classList.toggle('is-small', w < 640);
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(svg);
    else window.addEventListener('resize', fit);

    /* the descent, button-driven: zoom the world onto the cabins */
    const zoomBtn = document.getElementById('zoom-cabins');
    const home = svg.querySelector('.pin--cabins');
    if (zoomBtn && home && world) {
      const vb = svg.viewBox.baseVal;
      const [cx, cy] = home.dataset.xy.split(',').map(Number);
      const Z = Number(zoomBtn.dataset.zoom || 3);
      zoomBtn.addEventListener('click', () => {
        const zoomed = zoomBtn.getAttribute('aria-pressed') !== 'true';
        zoomBtn.setAttribute('aria-pressed', String(zoomed));
        zoomBtn.textContent = zoomed ? 'Show all of Yellowstone' : 'Zoom to the cabins';
        const s = zoomed ? Z : 1;
        const tx = zoomed ? vb.width / 2 - cx * s : 0;
        const ty = zoomed ? vb.height / 2 - cy * s : 0;
        world.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
        svg.style.setProperty('--z', s);
        svg.classList.toggle('is-zoomed', zoomed);
        if (zoomed) show('cabins');
      });
    }

    /* pins land the first time the map comes into view */
    pins.forEach((g, i) => g.style.setProperty('--i', Math.min(i, 30)));
    if ('IntersectionObserver' in window) {
      const mo = new IntersectionObserver((entries, obs) => {
        if (entries.some(e => e.isIntersecting)) { svg.classList.add('is-landed'); obs.disconnect(); }
      }, { threshold: 0.25 });
      mo.observe(svg);
    } else {
      svg.classList.add('is-landed');
    }
  }
})();
