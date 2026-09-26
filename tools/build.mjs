#!/usr/bin/env node
/* ============================================================================
   tools/build.mjs · authoring-time page generator (the Shakespeare pattern).
   Reads the data files and writes every page as finished static HTML, so the
   site is fast, readable with no JS, and indexable, while every fact still
   lives in exactly one place:

     js/config.js    business, contact, cabins, policies, reviews, checkout
     js/places.js    the guide: places, day plans, wildlife, food, supplies,
                     events, practical, seasons, map categories
     js/map-data.js  map geometry: park outline, lakes, roads

   Run after editing any of them:   node tools/build.mjs
   The output is committed; deploying needs no build step.
   The build FAILS on an em dash anywhere in the output (polish standard).
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const load = (file, names) =>
  vm.runInContext(`${read(file)}\n;({${names.join(', ')}})`, vm.createContext({}), { filename: file });

const { SAMPLE, CONFIG: C } = load('js/config.js', ['SAMPLE', 'CONFIG']);
const G = load('js/places.js', ['SEASONS', 'CATEGORIES', 'PLACES', 'DAYS', 'SIGHTS_NOTE', 'WILDLIFE', 'PARK_RULES', 'PARK_FACTS', 'FOOD', 'SUPPLIES', 'EVENTS', 'PRACTICAL']);
const { MAP } = load('js/map-data.js', ['MAP']);

/* ---- helpers ------------------------------------------------------------ */
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = `https://${C.business.domain}`;
const abs = p => SITE + p;
const telHref = p => 'tel:' + String(p).replace(/[^\d+]/g, '');
const drive = min => {
  if (min == null) return '';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return `${h} hr${m ? ` ${m} min` : ''}`;
};
const list = (arr, fn, sep = '\n') => (arr || []).map(fn).join(sep);
const B = C.business;
const phone = C.contact.phone;
const email = C.contact.email;
const year = new Date().getFullYear();
const warnings = [];

const icon = {
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

/* photos: every <img> goes through here so alt text and sizes come from config */
function pic(key, { sizes = '100vw', eager = false, cls = '', alt } = {}) {
  const p = C.photos[key];
  if (!p) throw new Error(`photo "${key}" is not registered in CONFIG.photos`);
  const h = Math.round(1200 * p.h / p.w);
  const base = `/assets/photos/${key}`;
  return `<img src="${base}-1200.jpg" srcset="${base}-640.webp 640w, ${base}-1200.webp 1200w, ${base}-2400.webp 2400w" sizes="${sizes}" width="1200" height="${h}" alt="${esc(alt ?? p.alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${cls ? ` class="${cls}"` : ''}>`;
}

/* ---- shell ---------------------------------------------------------------- */
const NAV = [
  ['/#cabins', 'The cabins'],
  ['/guide/', 'Things to do'],
  ['/map/', 'Map'],
  ['/#plan', 'Plan your stay'],
];

function header(current) {
  const links = list(NAV, ([href, label]) =>
    `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`, '');
  return `<a href="#main" class="skip">Skip to content</a>
${SAMPLE ? '<div class="sample-flag" role="note">Draft for review · sample content, not final</div>' : ''}
<header class="site-head on-dusk">
  <div class="wrap">
    <a class="brand" href="/"><b>${esc(B.short)}</b><span>Cabins in ${esc(B.city)}, ${esc(B.state)}</span></a>
    <nav class="nav" aria-label="Main">${links}</nav>
    ${phone ? `<a class="btn btn--quiet head-call" href="${telHref(phone)}">${icon.phone}<span class="short">Call</span><span class="long">${esc(phone)}</span></a>` : ''}
    <a class="btn btn--book head-book" href="/#book">Check dates</a>
    <button class="btn btn--quiet menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
  </div>
  <nav id="menu" class="menu" aria-label="Menu"><div class="wrap">${links}<a href="/#book">Check dates</a></div></nav>
</header>`;
}

function footer() {
  return `<footer class="site-foot on-dusk">
  <div class="wrap">
    <div class="cols">
      <div class="stack">
        <h2>${esc(B.name)}</h2>
        <address>${esc(B.street)}<br>${esc(B.city)}, ${esc(B.region)} ${esc(B.zip)}</address>
        ${phone ? `<p><a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}${esc(phone)}</a></p>` : ''}
        ${email ? `<p><a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
      </div>
      <div>
        <h3>Stay</h3>
        <ul>${list(C.cabins, c => `<li><a href="/cabins/${c.slug}/">${esc(c.name)}</a></li>`, '')}<li><a href="/#plan">Plan your stay</a></li><li><a href="/checkout/">Checkout guide</a></li></ul>
      </div>
      <div>
        <h3>Explore</h3>
        <ul><li><a href="/guide/">Things to do</a></li><li><a href="/map/">Yellowstone map</a></li><li><a href="/guide/#food">Food and groceries</a></li><li><a href="/guide/#wildlife">Wildlife</a></li></ul>
      </div>
    </div>
    <div class="fine">
      <span>&copy; ${year} ${esc(B.name)} · ${esc(B.city)}, ${esc(B.state)}</span>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
    </div>
  </div>
</footer>`;
}

function crumbsLd(trail) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })),
  };
}
function crumbsNav(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${list(trail, ([name, p], i) =>
    i === trail.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${p}">${esc(name)}</a></li>`, '')}</ol></nav>`;
}

function page({ route, title, desc, body, ld = [], index = true, current = '', progress = false, preload = [] }) {
  if (title.length > 65) warnings.push(`title over 65 chars (${title.length}) on ${route}: ${title}`);
  const robots = (!index || !C.launched) ? '<meta name="robots" content="noindex, nofollow">' : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${robots}
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${abs(route)}">
<meta name="theme-color" content="#0E1A15">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(B.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(route)}">
<meta property="og:image" content="${abs('/assets/og.jpg')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/besley-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/public-sans-var.woff2" as="font" type="font/woff2" crossorigin>
${list(preload, p => p, '\n')}
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/motion.css">
<script>document.documentElement.classList.add('js')</script>
${list(ld, o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)}
</head>
<body>
${progress ? '<div class="progress" aria-hidden="true"></div>' : ''}
${header(current)}
<main id="main">
${body}
</main>
${footer()}
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}

/* ---- shared bits ------------------------------------------------------------- */
const placeById = id => G.PLACES.find(p => p.id === id);
const seasonLabel = id => (G.SEASONS.find(s => s.id === id) || {}).label || id;

function seasonSwitch({ withAll = true, selected = 'all', label = 'Season' } = {}) {
  const opts = (withAll ? [{ id: 'all', label: 'All' }] : []).concat(G.SEASONS);
  return `<div class="seasons" role="group" aria-label="${esc(label)}" data-season-switch>${list(opts, s =>
    `<button type="button" data-season="${s.id}" aria-pressed="${s.id === selected}">${esc(s.label)}</button>`, '')}</div>`;
}

function guideCard(p, { photo = false } = {}) {
  const cat = G.CATEGORIES[p.cat] || { label: p.cat };
  const meta = [
    p.time && `<span>${esc(p.time)}</span>`,
    p.fee && `<span>${esc(p.fee)}</span>`,
    p.kids === true && '<span>Good with kids</span>',
  ].filter(Boolean).join('');
  const inner = `<span class="kind">${esc(p.kind || cat.label)}${p.area ? ` · ${esc(p.area)}` : ''}</span>
      <h3 id="g-${p.id}">${esc(p.name)}</h3>
      ${p.drive != null ? `<p class="drive">${drive(p.drive)} from the cabins</p>` : ''}
      <p>${esc(p.blurb)}</p>
      ${p.tip ? `<p class="tip">${esc(p.tip)}</p>` : ''}
      ${meta ? `<p class="meta">${meta}</p>` : ''}
      <p class="meta"><span>Best: ${esc(p.seasons.map(seasonLabel).join(', '))}</span>${p.url ? `<a href="${esc(p.url)}" rel="noopener">Official info</a>` : ''}</p>`;
  if (photo && p.photo) {
    return `<li class="guide-card guide-card--photo reveal" data-seasons="${p.seasons.join(' ')}">${pic(p.photo, { sizes: '(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw' })}<div class="in">${inner}</div></li>`;
  }
  return `<li class="guide-card reveal" data-seasons="${p.seasons.join(' ')}">${inner}</li>`;
}

function bookSlot(cabin) {
  if (cabin && cabin.widget) return `<div class="book-widget" data-cabin="${cabin.slug}">${cabin.widget}</div>`;
  return `<div class="book-slot">
      <h3>${cabin ? `Book ${esc(cabin.name)}` : 'Check dates'}</h3>
      <p>Online booking with live availability connects here at launch. Until then, reach Robyn directly for dates and rates.</p>
      <div class="row">
        ${phone ? `<a class="btn btn--book" href="${telHref(phone)}">${icon.phone}Call ${esc(phone)}</a>` : ''}
        ${email ? `<a class="btn btn--quiet" href="mailto:${esc(email)}?subject=${encodeURIComponent(`Dates${cabin ? ` for ${cabin.name}` : ''}`)}">Email for dates</a>` : ''}
      </div>
    </div>`;
}

/* ---- the map ----------------------------------------------------------------- */
const BD = MAP.bounds;
const K = Math.cos(((BD.n + BD.s) / 2) * Math.PI / 180);
const MW = 1000;
const MH = Math.round(MW * (BD.n - BD.s) / ((BD.e - BD.w) * K));
const px = lng => +(((lng - BD.w) / (BD.e - BD.w)) * MW).toFixed(1);
const py = lat => +(((BD.n - lat) / (BD.n - BD.s)) * MH).toFixed(1);
const pathOf = (ring, close = true) => ring.length ? 'M' + ring.map(([la, ln]) => `${px(ln)} ${py(la)}`).join('L') + (close ? 'Z' : '') : '';

function mapPoints() {
  return G.PLACES.filter(p => p.lat != null && p.lng != null && p.map !== false);
}

function mapBlock({ headingLevel = 'h2', big = false } = {}) {
  const pts = mapPoints();
  const cats = Object.entries(G.CATEGORIES).filter(([k]) => pts.some(p => p.cat === k) && k !== 'cabins');
  const shapes = MAP.shapes || {};
  const park = shapes.yellowstonePark ? `<path class="map__park" d="${pathOf(shapes.yellowstonePark)}"/>` : '';
  const water = Object.entries(shapes).filter(([k]) => k !== 'yellowstonePark')
    .map(([, ring]) => `<path class="map__water" d="${pathOf(ring)}"/>`).join('');
  const roads = Object.entries(MAP.roads || {}).map(([k, line]) =>
    `<path class="map__road${k === 'grandLoop' ? ' map__road--loop' : ''}" d="${pathOf(line, false)}"/>`).join('');
  const parkLabel = MAP.parkLabel ? `<text class="map__label--park" x="${px(MAP.parkLabel[1])}" y="${py(MAP.parkLabel[0])}" text-anchor="middle">YELLOWSTONE</text>` : '';
  const pins = pts.map(p => {
    const x = px(p.lng), y = py(p.lat);
    const lab = p.label ? `<text class="map__label" x="${p.labelSide === 'left' ? -12 : 12}" y="4"${p.labelSide === 'left' ? ' text-anchor="end"' : ''}>${esc(p.short || p.name)}</text>` : '';
    return `<g class="pin pin--${p.cat}" data-id="${p.id}" data-cat="${p.cat}" data-xy="${x},${y}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${esc(p.name)}${p.drive != null ? `, ${drive(p.drive)} from the cabins` : ''}"><circle r="7"/>${lab}</g>`;
  }).join('\n');
  const json = JSON.stringify(pts.map(p => ({
    id: p.id, name: p.name, kindLabel: (G.CATEGORIES[p.cat] || {}).label || p.cat,
    drive: p.drive != null ? drive(p.drive) : '', blurb: p.blurb,
    season: p.seasons ? p.seasons.map(seasonLabel).join(', ') : '',
    href: p.chapter ? `/guide/#g-${p.id}` : '',
  }))).replace(/</g, '\\u003c');
  const cabins = placeById('cabins');
  return `<div class="map${big ? ' map--big' : ''}">
    <figure class="map__frame">
      <svg class="map__svg" viewBox="0 0 ${MW} ${MH}" role="group" aria-label="Map of Yellowstone National Park and Island Park, with the cabins marked">
        <g class="map__world">
          ${park}${water}${roads}${parkLabel}
          ${pins}
        </g>
      </svg>
      <div class="map__controls on-dusk"><button class="btn btn--book" id="zoom-cabins" type="button" aria-pressed="false" data-zoom="${MAP.zoom || 3}">Zoom to the cabins</button></div>
    </figure>
    <div class="map__panel">
      <div class="map__filters" role="group" aria-label="Show on the map">${cats.map(([k, c]) =>
        `<button class="chip" type="button" data-cat="${k}" aria-pressed="true" style="--c:${c.color}"><i aria-hidden="true"></i>${esc(c.label)}</button>`).join('')}</div>
      <div class="map__card" id="map-card" aria-live="polite">
        <span class="kind">You are here</span>
        <${headingLevel === 'h2' ? 'h3' : 'h3'}>${esc(cabins ? cabins.name : 'The cabins')}</${headingLevel === 'h2' ? 'h3' : 'h3'}>
        <p>Tap any pin for what it is and how far it is from the cabins.</p>
      </div>
      <p class="map__legend">Drive times are estimates from the cabins in summer conditions. Winter closes most Yellowstone roads to cars; see the guide.</p>
    </div>
    <script type="application/json" id="map-points">${json}</script>
  </div>`;
}

/* ============================================================================
   PAGES
   ========================================================================== */
const out = [];
const emit = (file, html, { sitemap = true, route } = {}) => out.push({ file, html, sitemap, route });

/* ---- home -------------------------------------------------------------------- */
{
  const H = C.home;
  const featuredDrives = (H.drives || []).map(id => placeById(id)).filter(Boolean);
  const picks = G.PLACES.filter(p => p.pick);
  const cabinsHtml = list(C.cabins, c => `<li class="cabin-card reveal">
        <figure>${pic(c.photos[0], { sizes: '(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw' })}</figure>
        <h3><a href="/cabins/${c.slug}/">${esc(c.name)}</a></h3>
        <ul class="facts">${[c.sleeps && `Sleeps ${c.sleeps}`, c.bedrooms != null && `${c.bedrooms} bedroom${c.bedrooms === 1 ? '' : 's'}`, c.baths != null && `${c.baths} bath${c.baths === 1 ? '' : 's'}`].filter(Boolean).map(f => `<li>${f}</li>`).join('')}</ul>
        <p class="blurb">${esc(c.summary)}</p>
        <div class="row"><a class="btn btn--quiet" href="/cabins/${c.slug}/">See the cabin</a><a class="btn btn--book" href="/cabins/${c.slug}/#book">Check dates</a></div>
      </li>`);

  const reviews = (C.reviews || []).filter(r => r.text && r.name);
  const policies = (C.policies || []).filter(p => p.value);

  const body = `
<section class="hero on-dusk" aria-labelledby="hero-h" style="--descent-origin:${esc(H.descentOrigin || '38% 46%')}">
  <div class="hero__bg"><picture>
    <source media="(max-width: 40rem)" srcset="/assets/photos/teal-cabins-drive-640.webp 640w, /assets/photos/teal-cabins-drive-1200.webp 1200w" sizes="100vw">
    ${pic('canopy-three-roofs', { eager: true })}
  </picture></div>
  <div class="wrap"><div class="hero__copy">
    <span class="sign">${esc(B.city)}, ${esc(B.state)}</span>
    <h1 id="hero-h">${esc(H.h1)}</h1>
    <p class="hero__lede">${esc(H.lede)}</p>
    <div class="hero__actions">
      <a class="btn btn--book" href="#book">${icon.cal}Check dates</a>
      ${phone ? `<a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}Call ${esc(phone)}</a>` : ''}
    </div>
    ${H.facts && H.facts.length ? `<ul class="hero__facts">${list(H.facts, f => `<li>${f}</li>`, '')}</ul>` : ''}
  </div></div>
</section>

<section id="cabins" aria-labelledby="cabins-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">The cabins</span>
      <h2 id="cabins-h" class="reveal">${esc(H.cabinsHead)}</h2>
      <p>${esc(H.cabinsLede)}</p>
    </div>
    <ul class="cabins">${cabinsHtml}</ul>
  </div>
</section>

<section class="dusk on-dusk" id="where" aria-labelledby="where-h">
  <div class="wrap where">
    <div>
      <div class="sec-head">
        <span class="sign">Where you are</span>
        <h2 id="where-h" class="reveal">${esc(H.whereHead)}</h2>
        <p>${esc(H.whereLede)}</p>
      </div>
      <ul class="drives">${list(featuredDrives, p => `<li><span class="name">${esc(p.name)}<span class="sub">${esc((G.CATEGORIES[p.cat] || {}).label || '')}</span></span><span class="t">${drive(p.drive)}</span></li>`, '')}</ul>
      <p class="note" style="margin-top:1rem">Estimated drive times from the cabins in summer. <a href="/map/">Open the map</a></p>
    </div>
    <figure style="margin:0">${pic(H.wherePhoto, { sizes: '(min-width: 64rem) 45vw, 100vw' })}</figure>
  </div>
</section>

<section id="season" aria-labelledby="season-h">
  <div class="wrap" data-season-scope>
    <div class="sec-head">
      <span class="sign">Island Park by season</span>
      <h2 id="season-h" class="reveal">${esc(H.seasonHead)}</h2>
      <p>${esc(H.seasonLede)}</p>
    </div>
    ${seasonSwitch({ withAll: false, selected: H.defaultSeason, label: 'Pick a season' })}
    ${list(G.SEASONS, s => `<p class="season-note" data-season-note="${s.id}"${s.id === H.defaultSeason ? '' : ' hidden'}>${esc(s.note)}</p>`, '')}
    <ul class="cards cards--3">${list(picks, p => guideCard(p, { photo: true }))}</ul>
    <p class="empty-season" hidden>Nothing picked for this season yet.</p>
    <p style="margin-top:2rem"><a class="btn btn--quiet" href="/guide/">The full guide: food, groceries, wildlife, shows ${icon.arrow}</a></p>
  </div>
</section>

${reviews.length ? `<section class="raised" id="reviews" aria-labelledby="reviews-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Guests</span>
      <h2 id="reviews-h" class="reveal">What guests have said</h2>
    </div>
    <ul class="reviews">${list(reviews, r => `<li><figure class="review"><blockquote><p>${esc(r.text)}</p></blockquote><figcaption>${esc(r.name)}${r.date ? ` · ${esc(r.date)}` : ''}${r.source ? ` · ${esc(r.source)}` : ''}</figcaption></figure></li>`)}</ul>
  </div>
</section>` : ''}

<section id="plan" aria-labelledby="plan-h">
  <div class="wrap plan">
    <div>
      <div class="sec-head">
        <span class="sign">Plan your stay</span>
        <h2 id="plan-h" class="reveal">Before you come</h2>
      </div>
      ${policies.length ? `<dl class="policy">${list(policies, p => `<div><dt>${esc(p.label)}</dt><dd>${esc(p.value)}</dd></div>`, '')}</dl>` : ''}
    </div>
    <div class="faq">${list(C.faq, f => `<details><summary>${esc(f.q)}</summary><div><p>${esc(f.a)}</p></div></details>`, '')}</div>
  </div>
</section>

<section class="raised" id="book" aria-labelledby="book-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Book direct</span>
      <h2 id="book-h" class="reveal">Check dates with Robyn</h2>
      <p>${esc(H.bookLede)}</p>
    </div>
    ${bookSlot(null)}
  </div>
</section>`;

  const ld = [{
    '@context': 'https://schema.org', '@type': 'LodgingBusiness',
    name: B.name, url: abs('/'), image: abs('/assets/og.jpg'),
    ...(phone ? { telephone: phone } : {}), ...(email ? { email } : {}),
    address: { '@type': 'PostalAddress', streetAddress: B.street, addressLocality: B.city, addressRegion: B.region, postalCode: B.zip, addressCountry: 'US' },
    ...(B.lat != null ? { geo: { '@type': 'GeoCoordinates', latitude: B.lat, longitude: B.lng } } : {}),
    areaServed: `${B.city}, ${B.state} and Yellowstone National Park`,
  }];
  emit('index.html', page({
    route: '/', current: '/', title: C.seo.homeTitle, desc: C.seo.homeDesc, ld, body,
    preload: [
      '<link rel="preload" as="image" media="(max-width: 40rem)" imagesrcset="/assets/photos/teal-cabins-drive-640.webp 640w, /assets/photos/teal-cabins-drive-1200.webp 1200w" imagesizes="100vw" fetchpriority="high">',
      '<link rel="preload" as="image" media="(min-width: 40.01rem)" imagesrcset="/assets/photos/canopy-three-roofs-1200.webp 1200w, /assets/photos/canopy-three-roofs-2400.webp 2400w" imagesizes="100vw" fetchpriority="high">',
    ],
  }), { route: '/' });
}

/* ---- cabin pages --------------------------------------------------------------- */
for (const c of C.cabins) {
  const route = `/cabins/${c.slug}/`;
  const trail = [['Home', '/'], [c.name, route]];
  const facts = [c.sleeps && `Sleeps ${c.sleeps}`, c.bedrooms != null && `${c.bedrooms} bedroom${c.bedrooms === 1 ? '' : 's'}`, c.beds && c.beds, c.baths != null && `${c.baths} bath${c.baths === 1 ? '' : 's'}`].filter(Boolean);
  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">${esc(B.city)}, ${esc(B.state)}</span>
  <h1 style="margin-top:.9rem">${esc(c.name)}</h1>
  <ul class="facts" style="margin-top:1rem">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
</div>
<div class="wrap">
  <div class="gallery">${list(c.photos.slice(0, 3), (k, i) => pic(k, { sizes: i === 0 ? '(min-width: 64rem) 50vw, 100vw' : '(min-width: 64rem) 25vw, 50vw', eager: i === 0 }), '')}</div>
</div>
<section>
  <div class="wrap cabin-body">
    <div class="stack" style="--stack:1.25rem">
      <h2 class="reveal">${esc(c.headline || 'The cabin')}</h2>
      ${list(c.description, para => `<p>${esc(para)}</p>`)}
      ${c.amenities && c.amenities.length ? `<h3 style="margin-top:2rem">What's here</h3><ul class="amenities">${list(c.amenities, a => `<li>${esc(a)}</li>`, '')}</ul>` : ''}
    </div>
    <aside id="book">${bookSlot(c)}</aside>
  </div>
</section>`;
  emit(`cabins/${c.slug}/index.html`, page({
    route, current: '/#cabins',
    title: `${c.name} · Cabin in ${B.city}, ${B.region} | ${B.short}`,
    desc: c.metaDesc || `${c.name}: ${facts.join(', ')}. A cabin in the ${B.city} pines near Yellowstone. Book direct.`,
    ld: [crumbsLd(trail)], body,
  }), { route });
}

/* ---- guide ------------------------------------------------------------------- */
{
  const route = '/guide/';
  const trail = [['Home', '/'], ['Things to do', route]];
  const chapters = [
    ['yellowstone', 'Yellowstone'], ['island-park', 'Island Park'], ['wildlife', 'Wildlife'],
    ['shows', 'Shows and rainy days'], ['food', 'Food'], ['supplies', 'Groceries and supplies'],
    ['events', 'Events'], ['practical', 'Good to know'],
  ];
  const byChapter = ch => G.PLACES.filter(p => p.chapter === ch);
  const chapterCards = ch => {
    const items = byChapter(ch);
    return items.length ? `<ul class="cards cards--3">${list(items, p => guideCard(p))}</ul><p class="empty-season" hidden>Nothing in this chapter for that season. Try another.</p>` : '';
  };
  const table = (rows, cols) => rows && rows.length ? `<div class="table-wrap"><table class="simple"><thead><tr>${cols.map(([, h]) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${list(rows, r => `<tr>${cols.map(([k]) => {
    if (k === 'drive') return `<td class="num drive">${r.drive != null ? drive(r.drive) : ''}</td>`;
    if (k === 'name') return `<td><b>${r.url ? `<a href="${esc(r.url)}" rel="noopener">${esc(r.name)}</a>` : esc(r.name)}</b></td>`;
    return `<td>${esc(r[k] ?? '')}</td>`;
  }).join('')}</tr>`, '')}</tbody></table></div>` : '';

  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">${esc(B.city)} and Yellowstone</span>
  <h1 style="margin-top:.9rem">Things to do near ${esc(B.city)} and Yellowstone</h1>
  <p class="lede">${esc(C.guide.lede)}</p>
  <p style="margin-top:1.25rem"><button class="btn btn--quiet" type="button" data-print hidden>Print this guide</button></p>
</div>

<div class="guide-bar">
  <div class="wrap">
    ${seasonSwitch({ withAll: true, selected: 'all', label: 'Show things to do in' })}
    <ul class="chapters" aria-label="Chapters">${chapters.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join('')}</ul>
  </div>
</div>

<section class="chapter" id="yellowstone" aria-labelledby="ys-h">
  <div class="wrap" data-season-scope>
    <div class="sec-head">
      <span class="sign">Chapter 1</span>
      <h2 id="ys-h" class="reveal">Yellowstone, from the West Entrance</h2>
      <p>${esc(C.guide.yellowstoneLede)}</p>
    </div>
    ${mapBlock()}
    ${G.PARK_FACTS && G.PARK_FACTS.length ? `<h3 style="margin:3rem 0 1rem">Before you go in</h3><dl class="policy">${list(G.PARK_FACTS, f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}${f.url ? ` <a href="${esc(f.url)}" rel="noopener">Source</a>` : ''}</dd></div>`, '')}</dl>` : ''}
    ${G.DAYS && G.DAYS.length ? `<h3 style="margin:3rem 0 1rem">Day plans from the cabins</h3>
    <ul class="days">${list(G.DAYS, d => `<li class="day reveal" data-seasons="${(d.seasons || ['summer', 'fall', 'spring']).join(' ')}"><h3>${esc(d.title)}</h3><p class="drive">${esc(d.driveNote)}</p><p style="margin-top:.5rem">${esc(d.summary)}</p><ol>${list(d.stops, s => `<li>${esc(s)}</li>`, '')}</ol></li>`)}</ul>` : ''}
    <h3 style="margin:3rem 0 1rem">The big sights</h3>
    ${G.SIGHTS_NOTE ? `<p class="note" style="margin-bottom:1rem">${esc(G.SIGHTS_NOTE)}</p>` : ''}
    ${chapterCards('yellowstone')}
    ${G.PARK_RULES && G.PARK_RULES.length ? `<h3 style="margin:3rem 0 1rem">Park rules that matter</h3><ul class="rules">${list(G.PARK_RULES, r => `<li>${esc(r)}</li>`, '')}</ul>` : ''}
  </div>
</section>

<section class="chapter" id="island-park" aria-labelledby="ip-h">
  <div class="wrap" data-season-scope>
    <div class="sec-head">
      <span class="sign">Chapter 2</span>
      <h2 id="ip-h" class="reveal">Island Park, outside the park</h2>
      <p>${esc(C.guide.islandParkLede)}</p>
    </div>
    ${chapterCards('island-park')}
  </div>
</section>

<section class="chapter" id="wildlife" aria-labelledby="wl-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Chapter 3</span>
      <h2 id="wl-h" class="reveal">Wildlife: where, when, how close</h2>
      <p>${esc(C.guide.wildlifeLede)}</p>
    </div>
    ${table(G.WILDLIFE, [['name', 'Animal'], ['where', 'Where to look'], ['when', 'When'], ['fact', 'Worth knowing']])}
  </div>
</section>

<section class="chapter" id="shows" aria-labelledby="sh-h">
  <div class="wrap" data-season-scope>
    <div class="sec-head">
      <span class="sign">Chapter 4</span>
      <h2 id="sh-h" class="reveal">Shows, museums and rainy days</h2>
      <p>${esc(C.guide.showsLede)}</p>
    </div>
    ${chapterCards('shows')}
  </div>
</section>

<section class="chapter" id="food" aria-labelledby="fd-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Chapter 5</span>
      <h2 id="fd-h" class="reveal">Where to eat</h2>
      <p>${esc(C.guide.foodLede)}</p>
    </div>
    ${table(G.FOOD, [['name', 'Place'], ['kind', 'Food'], ['town', 'Where'], ['drive', 'Drive'], ['note', 'Good to know']])}
  </div>
</section>

<section class="chapter" id="supplies" aria-labelledby="sp-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Chapter 6</span>
      <h2 id="sp-h" class="reveal">Groceries, gas and supplies</h2>
      <p>${esc(C.guide.suppliesLede)}</p>
    </div>
    ${table(G.SUPPLIES, [['name', 'Store'], ['kind', 'What'], ['town', 'Where'], ['drive', 'Drive'], ['note', 'Good to know']])}
  </div>
</section>

<section class="chapter" id="events" aria-labelledby="ev-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Chapter 7</span>
      <h2 id="ev-h" class="reveal">Events through the year</h2>
      <p>${esc(C.guide.eventsLede)}</p>
    </div>
    ${table(G.EVENTS, [['when', 'When'], ['name', 'Event'], ['town', 'Where'], ['note', 'What it is']])}
  </div>
</section>

<section class="chapter" id="practical" aria-labelledby="pr-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Chapter 8</span>
      <h2 id="pr-h" class="reveal">Good to know</h2>
    </div>
    <dl class="policy">${list(G.PRACTICAL, f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}${f.url ? ` <a href="${esc(f.url)}" rel="noopener">Source</a>` : ''}</dd></div>`, '')}</dl>
    <p class="note" style="margin-top:1.5rem">${esc(C.guide.checkedNote)}</p>
  </div>
</section>`;

  emit('guide/index.html', page({
    route, current: '/guide/', progress: true,
    title: `Things to Do in ${B.city} and Yellowstone | ${B.short}`,
    desc: C.seo.guideDesc, ld: [crumbsLd(trail)], body,
  }), { route });
}

/* ---- map page (the QR code on the pamphlet points here) ---------------------- */
{
  const route = '/map/';
  const trail = [['Home', '/'], ['Yellowstone map', route]];
  const pts = mapPoints().filter(p => p.cat !== 'cabins');
  const grouped = Object.entries(G.CATEGORIES).map(([k, c]) => [c, pts.filter(p => p.cat === k)]).filter(([, a]) => a.length);
  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">Map</span>
  <h1 style="margin-top:.9rem">Yellowstone and ${esc(B.city)}, from the cabins</h1>
  <p class="lede">Every stop in our guide on one map, with the drive time from the cabins. Tap a pin, or use the list below.</p>
</div>
<section style="padding-top:0">
  <div class="wrap">
    ${mapBlock({ big: true })}
    <h2 style="margin:3rem 0 1rem" class="reveal">Everything on the map</h2>
    ${grouped.map(([c, a]) => `<h3 style="margin:1.5rem 0 .5rem">${esc(c.label)}</h3><ul class="map__list">${list(a, p => `<li><button type="button" data-show-pin="${p.id}">${esc(p.name)}</button>${p.drive != null ? ` <span class="drive">${drive(p.drive)}</span>` : ''}</li>`, '')}</ul>`).join('')}
  </div>
</section>`;
  emit('map/index.html', page({
    route, current: '/map/',
    title: `Yellowstone and ${B.city} Map | ${B.short}`,
    desc: `Interactive map of Yellowstone National Park and ${B.city}, ${B.state}: geysers, canyons, wildlife valleys, towns and entrances, with drive times from ${B.name}.`,
    ld: [crumbsLd(trail)], body,
  }), { route });
}

/* ---- checkout (QR code inside each cabin points here; never indexed) -------------- */
{
  const route = '/checkout/';
  const trail = [['Home', '/'], ['Checkout guide', route]];
  const X = C.checkout;
  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">For guests</span>
  <h1 style="margin-top:.9rem">Checking out</h1>
  <p class="lede">${X.time ? `Checkout is by ${esc(X.time)}. ` : ''}${esc(X.lede)}</p>
</div>
<section style="padding-top:0">
  <div class="wrap">
    <ol class="checklist">${list(X.steps, s => `<li><div><b>${esc(s.title)}</b>${s.detail ? `<p>${esc(s.detail)}</p>` : ''}</div></li>`, '')}</ol>
    <div class="book-slot" style="margin-top:2.5rem">
      <h2 style="font-size:var(--step-2)">${esc(X.returnHead)}</h2>
      <p>${esc(X.returnLede)}</p>
      <div class="row"><a class="btn btn--book" href="/#book">Book your next stay</a>${phone ? `<a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}Call Robyn</a>` : ''}</div>
    </div>
  </div>
</section>`;
  emit('checkout/index.html', page({
    route, index: false, title: `Checkout Guide | ${B.short}`,
    desc: `How to check out of your ${B.name} cabin in ${B.city}, ${B.state}.`,
    ld: [crumbsLd(trail)], body,
  }), { route, sitemap: false });
}

/* ---- 404 ------------------------------------------------------------------------ */
emit('404.html', page({
  route: '/404', index: false, title: `Page not found | ${B.short}`,
  desc: `That page is not here. Find the cabins, the Island Park guide or the Yellowstone map.`,
  body: `
<div class="wrap page-head">
  <span class="sign">Off trail</span>
  <h1 style="margin-top:.9rem">That page isn't here.</h1>
  <p class="lede">The link may be from our old site, or the address has a typo. These will get you back on track:</p>
  <p style="margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:.6rem"><a class="btn btn--book" href="/#cabins">See the cabins</a><a class="btn btn--quiet" href="/guide/">Things to do</a><a class="btn btn--quiet" href="/map/">Map</a>${phone ? `<a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}Call Robyn</a>` : ''}</p>
</div>`,
}), { sitemap: false });

/* ---- privacy + terms ---------------------------------------------------------------- */
{
  const contactLine = [email, phone].filter(Boolean).join(' or ') || '[your email]';
  const launched = C.launched || '[your launch date]';
  const privacyBody = `
<div class="wrap page-head">
  ${crumbsNav([['Home', '/'], ['Privacy policy', '/privacy/']])}
  <h1>Privacy policy</h1>
  <p class="lede">Last updated ${esc(launched)}</p>
</div>
<section style="padding-top:0"><div class="wrap stack" style="--stack:1rem">
  <h2 style="font-size:var(--step-2)">Who we are</h2>
  <p>${esc(B.name)}, ${esc(B.city)}, ${esc(B.state)}. Questions: ${esc(contactLine)}.</p>
  <h2 style="font-size:var(--step-2)">What we collect</h2>
  <p><b>What you send us.</b> When you call, text or email us, we receive what you include, such as your name, dates and group size.</p>
  <p><b>Bookings.</b> Reservations and payments are handled by our booking system, OwnerRez, which collects the details needed to book and pay. Its own privacy policy applies to that information.</p>
  <p><b>Usage data.</b> This site does not use analytics or advertising cookies. Our host keeps standard technical logs (such as IP address and time of request) to run and protect the site.</p>
  <h2 style="font-size:var(--step-2)">Who processes it for us</h2>
  <p>OwnerRez (bookings and payments), our website host, and our email provider. Fonts are served from this site, not a third party. We don't sell or rent personal information.</p>
  <h2 style="font-size:var(--step-2)">How long we keep it, and your choices</h2>
  <p>We keep booking and inquiry records as long as we need them to host you and keep normal business and tax records. Contact ${esc(contactLine)} to see, correct or delete what we hold about you.</p>
  <h2 style="font-size:var(--step-2)">Changes</h2>
  <p>If this policy changes, we'll update it here and change the date at the top.</p>
</div></section>`;
  emit('privacy/index.html', page({
    route: '/privacy/', title: `Privacy Policy | ${B.short}`,
    desc: `How ${B.name} handles the information you send us and your booking details.`,
    ld: [crumbsLd([['Home', '/'], ['Privacy policy', '/privacy/']])], body: privacyBody,
  }), { route: '/privacy/' });

  const termsBody = `
<div class="wrap page-head">
  ${crumbsNav([['Home', '/'], ['Terms of use', '/terms/']])}
  <h1>Terms of use</h1>
  <p class="lede">Last updated ${esc(launched)}</p>
</div>
<section style="padding-top:0"><div class="wrap stack" style="--stack:1rem">
  <h2 style="font-size:var(--step-2)">Using this site</h2>
  <p>By using this website you agree to these terms. Stays themselves are governed by the rental agreement you accept when you book, not by this page.</p>
  <h2 style="font-size:var(--step-2)">Our content</h2>
  <p>The text, photos and design on this site belong to ${esc(B.name)}. You're welcome to share links; please don't copy or republish them.</p>
  <h2 style="font-size:var(--step-2)">Rates, availability and the guide</h2>
  <p>Rates and availability are confirmed at booking. The things-to-do guide is general information we gathered from official and local sources; hours, fees, road openings and events change, so check with the operator before you go.</p>
  <h2 style="font-size:var(--step-2)">No warranty</h2>
  <p>The site is provided as is. We work to keep it accurate and online, but can't promise it will always be error free.</p>
  <h2 style="font-size:var(--step-2)">Governing law and contact</h2>
  <p>These terms are governed by the laws of the State of Idaho. Contact: ${esc(contactLine)}.</p>
</div></section>`;
  emit('terms/index.html', page({
    route: '/terms/', title: `Terms of Use | ${B.short}`,
    desc: `The terms for using the ${B.name} website.`,
    ld: [crumbsLd([['Home', '/'], ['Terms of use', '/terms/']])], body: termsBody,
  }), { route: '/terms/' });
}

/* ---- write, guard, site files ---------------------------------------------------------- */
let failed = false;
for (const { file, html } of out) {
  const bad = html.indexOf('—');
  if (bad > -1) { failed = true; console.error(`EM DASH in ${file}: ...${html.slice(Math.max(0, bad - 50), bad + 30).replace(/\s+/g, ' ')}...`); }
  const en = html.indexOf('–');
  if (en > -1) warnings.push(`en dash in ${file}: ...${html.slice(Math.max(0, en - 40), en + 20).replace(/\s+/g, ' ')}...`);
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, file), html.replace(/\n{3,}/g, '\n\n'));
}
const routes = out.filter(o => o.sitemap && o.route).map(o => o.route);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url><loc>${abs(r)}</loc></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), C.launched
  ? `User-agent: *\nAllow: /\nDisallow: /checkout/\n\nSitemap: ${abs('/sitemap.xml')}\n`
  : `User-agent: *\nDisallow: /\n\n# Pre-launch. At launch: Allow: /, Disallow: /checkout/, and\n# Sitemap: ${abs('/sitemap.xml')}\n`);
fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# ${B.name}

> ${C.seo.llms}

Address: ${B.street}, ${B.city}, ${B.region} ${B.zip}
${phone ? `Phone: ${phone}\n` : ''}${email ? `Email: ${email}\n` : ''}Booking: direct through this website (OwnerRez booking engine)

## Pages

- [Home](${abs('/')}): the cabins, where they are, what to do by season, booking
${C.cabins.map(c => `- [${c.name}](${abs(`/cabins/${c.slug}/`)}): ${[c.sleeps && `sleeps ${c.sleeps}`, c.bedrooms != null && `${c.bedrooms} bedrooms`, c.baths != null && `${c.baths} baths`].filter(Boolean).join(', ')}`).join('\n')}
- [Things to do](${abs('/guide/')}): Yellowstone and ${B.city} guide with drive times, food, groceries, wildlife, events
- [Map](${abs('/map/')}): interactive map of Yellowstone and ${B.city} with the cabins marked
- [Privacy policy](${abs('/privacy/')})
- [Terms of use](${abs('/terms/')})
`);

for (const w of warnings) console.warn('warn:', w);
console.log(`built ${out.length} pages${SAMPLE ? ' (SAMPLE = true, draft flag on)' : ''}`);
if (failed) process.exit(1);
