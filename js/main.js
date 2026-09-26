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

  /* ---- OwnerRez widgets: only on the approved domain -----------------
     OwnerRez refuses (403) widget requests from any other host, so a
     preview would show empty boxes. Load widget.js where it works;
     everywhere else, say plainly what appears here at launch. */
  const orMeta = document.querySelector('meta[name="ownerrez"]');
  if (orMeta) {
    const hosts = (orMeta.dataset.hosts || '').split(' ');
    if (hosts.includes(location.hostname)) {
      const s = document.createElement('script');
      s.src = orMeta.content;
      document.body.append(s);
    } else {
      document.querySelectorAll('.or-widget').forEach(w => {
        const type = (w.querySelector('.ownerrez-widget') || {}).dataset?.widgetType || '';
        const name = { 'Booking/Inquiry': 'booking form', 'Reviews': 'guest reviews' }[type] || 'availability calendar';
        w.classList.add('or-widget--preview');
        w.innerHTML = `<p>The live ${name} from OwnerRez loads here on ${hosts[0] || 'the live site'}.</p>`;
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
  };
  if (switches.length) {
    switches.forEach(sw => sw.addEventListener('click', e => {
      const b = e.target.closest('button[data-season]');
      if (b) applySeason(b.dataset.season);
    }));
    const saved = store.get('we-season');
    const first = switches[0].querySelector('button[aria-pressed="true"]');
    applySeason(saved && switches[0].querySelector(`[data-season="${saved}"]`) ? saved
      : first ? first.dataset.season : 'all');
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
