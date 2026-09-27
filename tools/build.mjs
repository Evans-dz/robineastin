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
const esc = s => String(s ?? '')
  .replace(/(\w)'(\w)/g, '$1\u2019$2')                 /* Henry's -> Henry’s */
  .replace(/(^|[\s(])"(\S)/g, '$1\u201C$2').replace(/(\S)"(?=[\s.,;:)!?]|$)/g, '$1\u201D')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = `https://${C.business.domain}`;
const abs = p => SITE + p;
const telHref = p => 'tel:' + String(p).replace(/[^\d+]/g, '');
const NB = '\u00A0';                                     /* non-breaking space */
const drive = min => {
  if (min == null) return '';
  if (min < 60) return `${min}${NB}min`;
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}${NB}hr${m ? `${NB}${m}${NB}min` : ''}`;
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
  return `<img src="${base}-1200.jpg" srcset="${base}-640.webp 640w, ${base}-1200.webp 1200w, ${base}-2400.webp 2400w" sizes="${sizes}" width="1200" height="${h}" alt="${esc(alt ?? p.alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${cls ? ` class="${cls}"` : ''}${p.focus ? ` style="object-position:${p.focus}"` : ''}>`;
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
    <a class="brand" href="/" translate="no"><b>${esc(B.short)}</b><span>Cabins in ${esc(B.city)}, ${esc(B.state)}</span></a>
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
  const usesWidgets = body.includes('ownerrez-widget');
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
${body.includes('uc.orez.io') ? '<link rel="preconnect" href="https://uc.orez.io">' : ''}
${list(preload, p => p, '\n')}
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/motion.css">
<script>document.documentElement.classList.add('js')</script>
${usesWidgets && OR.script ? `<meta name="ownerrez" content="${esc(OR.script)}" data-blocked="${esc((OR.blockedHosts || []).join(' '))}">` : ''}
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
      <p class="meta"><span>Best: ${esc((p.bestSeasons || p.seasons).map(seasonLabel).join(', '))}</span>${p.url ? `<a href="${esc(p.url)}" rel="noopener">Official info</a>` : ''}</p>`;
  if (photo && p.photo) {
    return `<li class="guide-card guide-card--photo reveal" data-seasons="${p.seasons.join(' ')}">${pic(p.photo, { sizes: '(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw' })}<div class="in">${inner}</div></li>`;
  }
  return `<li class="guide-card reveal" data-seasons="${p.seasons.join(' ')}">${inner}</li>`;
}

/* OwnerRez widgets: widget.js swaps each placeholder for an iframe.
   Without JS the placeholder stays empty, so every slot carries a
   noscript line and a call/email row that always works.           */
const OR = C.booking || {};
const orWidget = (type, widgetId, propertyKey) => widgetId ? `<div class="or-widget or-widget--${type.toLowerCase().replace(/[^a-z]+/g, '-')}"><div class="ownerrez-widget" data-widget-type="${type}" data-widgetId="${widgetId}"${propertyKey ? ` data-propertyId="${propertyKey}"` : ''}></div></div>` : '';
const contactRow = subject => `<div class="row">
        ${phone ? `<a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}Call ${esc(phone)}</a>` : ''}
        ${email ? `<a class="btn btn--quiet" href="mailto:${esc(email)}?subject=${encodeURIComponent(subject)}">Email Robyn</a>` : ''}
      </div>`;
function bookSlot(cabin) {
  const widget = cabin
    ? orWidget('Booking/Inquiry', (OR.perCabin || {}).booking, cabin.ownerrez && cabin.ownerrez.key)
    : orWidget('Booking/Inquiry', (OR.all || {}).booking);
  return `<div class="book-slot">
      <h3>${cabin ? `Book ${esc(cabin.name)}` : 'Pick your dates'}</h3>
      ${widget || '<p>Online booking with live availability connects here at launch.</p>'}
      <noscript><p>The booking calendar needs JavaScript. Call or email Robyn for dates.</p></noscript>
      <p class="note">Prefer to talk it through, or booking both cabins?</p>
      ${contactRow(`Dates${cabin ? ` for ${cabin.name}` : ''}`)}
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

function mapBlock({ parent = 'h2', big = false } = {}) {
  const hc = parent === 'h1' ? 'h2' : 'h3';          /* card heading sits one below its section */
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
    const side = p.labelSide === 'left' ? 'l' : 'r';
    const lab = p.label ? `<text class="map__label map__label--${p.label} map__label--${side}" y="4"${side === 'l' ? ' text-anchor="end"' : ''}>${esc(p.short || p.name)}</text>` : '';
    return `<g class="pin pin--${p.cat}" data-id="${p.id}" data-cat="${p.cat}" data-xy="${x},${y}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${esc(p.name)}${p.drive != null ? `, ${drive(p.drive)} from the cabins` : ''}"><circle r="7"/>${lab}</g>`;
  }).join('\n');
  const typo = t => String(t ?? '').replace(/(\w)'(\w)/g, '$1\u2019$2');
  const json = JSON.stringify(pts.map(p => ({
    id: p.id, name: typo(p.name), kindLabel: (G.CATEGORIES[p.cat] || {}).label || p.cat,
    drive: p.drive != null ? drive(p.drive) : '', blurb: typo(p.blurb),
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
        <${hc}>${esc(cabins ? cabins.name : 'The cabins')}</${hc}>
        <p>Tap any pin for what it is and how far it is from the cabins.</p>
      </div>
      <p class="map__legend">Drive times are estimates from the cabins in summer conditions. Winter closes most Yellowstone roads to cars; see the guide.</p>
      <p class="map__legend">Map data &copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> contributors. Routes by OSRM.</p>
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
  /* curated per season: a card shows in the seasons it is PICKED for */
  const pickSeasons = new Map();
  for (const [season, ids] of Object.entries(H.picks || {})) for (const id of ids) {
    if (!placeById(id)) throw new Error(`home pick "${id}" is not in PLACES`);
    pickSeasons.set(id, [...(pickSeasons.get(id) || []), season]);
  }
  const picks = [...pickSeasons.keys()].map(id => ({ ...placeById(id), seasons: pickSeasons.get(id), bestSeasons: placeById(id).seasons }));
  const cabinsHtml = list(C.cabins, c => `<li class="cabin-card reveal">
        <figure>${pic(c.photos[0], { sizes: '(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw' })}</figure>
        <h3 translate="no"><a href="/cabins/${c.slug}/">${esc(c.name)}</a></h3>
        <ul class="facts">${[c.sleeps && `Sleeps ${c.sleeps}`, c.bedrooms != null && `${c.bedrooms} bedroom${c.bedrooms === 1 ? '' : 's'}`, c.baths != null && `${c.baths} bath${c.baths === 1 ? '' : 's'}`, c.sqft && `${c.sqft.toLocaleString('en-US')} sq ft`].filter(Boolean).map(f => `<li>${f}</li>`).join('')}</ul>
        <p class="blurb">${esc(c.summary)}</p>
        <div class="row"><a class="btn btn--quiet" href="/cabins/${c.slug}/">See the cabin</a><a class="btn btn--book" href="/cabins/${c.slug}/#book">Check dates</a></div>
      </li>`);

  const R = C.ratings || { items: [] };
  const policies = (C.policies || []).filter(p => p.value);

  const body = `
<section class="hero on-dusk" aria-labelledby="hero-h" style="--hero-pos:${esc(H.heroPos)};--descent-origin:${esc(H.descentOrigin)};--hero-pos-m:${esc(H.heroPosMobile)};--descent-origin-m:${esc(H.descentOriginMobile)}">
  <div class="hero__bg">${pic(H.heroPhoto, { eager: true })}</div>
  <div class="wrap"><div class="hero__copy">
    <div class="hero__head">
      <span class="sign">${esc(B.city)}, ${esc(B.state)}</span>
      <h1 id="hero-h">${esc(H.h1)}</h1>
    </div>
    <p class="hero__lede">${esc(H.lede)}</p>
    <div class="hero__actions">
      <a class="btn btn--book" href="#book">${icon.cal}Check dates</a>
      ${phone ? `<a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}Call ${esc(phone)}</a>` : ''}
    </div>
  </div></div>
</section>
<div class="hero-after on-dusk">
  <div class="wrap">
    <p class="hero__lede">${esc(H.lede)}</p>
    ${H.facts && H.facts.length ? `<ul class="hero__facts">${list(H.facts, f => `<li>${f}</li>`, '')}</ul>` : ''}
  </div>
</div>

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
    <p style="margin-top:2rem"><a class="btn btn--quiet btn--wrap" href="/guide/">The full guide: food, groceries, wildlife, shows ${icon.arrow}</a></p>
  </div>
</section>

<section class="raised" id="reviews" aria-labelledby="reviews-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Guests</span>
      <h2 id="reviews-h" class="reveal">What guests have said</h2>
      <p>Reviews from real stays, pulled straight from Robyn's booking system as they come in.</p>
    </div>
    ${R.items.length ? `<ul class="ratings">${list(R.items, r => `<li><a href="${esc(r.url)}" rel="noopener"><b>${esc(r.score)}</b><span>${esc(r.where)} · ${esc(r.what)}</span><small>${r.count} reviews</small></a></li>`, '')}</ul>
    <p class="note" style="margin:.75rem 0 2rem">Ratings as shown on each site, ${esc(R.asOf)}.</p>` : ''}
    ${orWidget('Reviews', (OR.all || {}).reviews)}
    <noscript><p>Guest reviews load from our booking system and need JavaScript.</p></noscript>
  </div>
</section>

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
    <div class="book-grid">
      ${bookSlot(null)}
      <div class="stack">
        ${orWidget('Ribbon Calendar', (OR.all || {}).calendar)}
        ${H.hosts ? `<div class="hosts"><h3>Your hosts</h3><p>${esc(H.hosts)}</p></div>` : ''}
      </div>
    </div>
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
    preload: [`<link rel="preload" as="image" imagesrcset="/assets/photos/${H.heroPhoto}-640.webp 640w, /assets/photos/${H.heroPhoto}-1200.webp 1200w, /assets/photos/${H.heroPhoto}-2400.webp 2400w" imagesizes="100vw" fetchpriority="high">`],
  }), { route: '/' });
}

/* ---- cabin pages --------------------------------------------------------------- */
const orPhoto = (g, size, eager) => `<img src="https://uc.orez.io/i/${g.id}-${size}" alt="${esc(g.alt)}" width="1200" height="900"${eager ? '' : ' loading="lazy" decoding="async"'}>`;
for (const c of C.cabins) {
  const route = `/cabins/${c.slug}/`;
  const trail = [['Home', '/'], [c.name, route]];
  const other = C.cabins.find(x => x.slug !== c.slug);
  const facts = [c.sleeps && `Sleeps ${c.sleeps}`, c.bedrooms != null && `${c.bedrooms} bedroom${c.bedrooms === 1 ? '' : 's'}`, c.baths != null && `${c.baths} bath${c.baths === 1 ? '' : 's'}`, c.sqft && `${c.sqft.toLocaleString('en-US')} sq ft`].filter(Boolean);
  const gal = c.gallery || [];
  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">${esc(c.address)}, ${esc(B.city)}</span>
  <h1 style="margin-top:.9rem" translate="no">${esc(c.name)}</h1>
  <ul class="facts" style="margin-top:1rem">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
</div>
<div class="wrap">
  <div class="gallery">${pic(c.photos[0], { sizes: '(min-width: 64rem) 50vw, 100vw', eager: true })}${list(gal.slice(0, 4), (g, i) => orPhoto(g, 'Medium', false), '')}</div>
</div>
<section>
  <div class="wrap cabin-body">
    <div class="stack" style="--stack:1.25rem">
      <h2 class="reveal">${esc(c.headline || 'The cabin')}</h2>
      ${list(c.description, para => `<p>${esc(para)}</p>`)}
      <p class="note">Sleeps ${c.sleeps}: ${esc(c.beds)}.</p>
      ${c.amenities && c.amenities.length ? `<h3 style="margin-top:2rem">What's here</h3><ul class="amenities">${list(c.amenities, a => `<li>${esc(a)}</li>`, '')}</ul>` : ''}
      ${gal.length > 4 ? `<h3 style="margin-top:2rem">More photos</h3><div class="more-photos">${list(gal.slice(4), g => orPhoto(g, 'Medium', false), '')}</div>` : ''}
      ${other ? `<div class="book-slot" style="margin-top:2rem"><h3>Bringing everyone?</h3><p>${esc(other.name)} is right next door and sleeps ${other.sleeps}. Book both and keep the whole group together.</p><p><a class="btn btn--quiet" href="/cabins/${other.slug}/">See ${esc(other.name)} ${icon.arrow}</a></p></div>` : ''}
    </div>
    <aside id="book">${bookSlot(c)}</aside>
  </div>
</section>
<section class="raised" aria-labelledby="avail-h">
  <div class="wrap">
    <div class="sec-head"><span class="sign">Availability</span><h2 id="avail-h" class="reveal">Open dates</h2></div>
    ${orWidget('Multiple Month Calendar', (OR.perCabin || {}).calendar, c.ownerrez && c.ownerrez.key)}
    <noscript><p>The calendar needs JavaScript. Call or email Robyn for dates.</p></noscript>
  </div>
</section>
<section aria-labelledby="rev-h">
  <div class="wrap">
    <div class="sec-head"><span class="sign">Guests</span><h2 id="rev-h" class="reveal">Reviews of ${esc(c.name)}</h2></div>
    ${orWidget('Reviews', (OR.perCabin || {}).reviews, c.ownerrez && c.ownerrez.key)}
    <noscript><p>Guest reviews load from our booking system and need JavaScript.</p></noscript>
  </div>
</section>`;
  emit(`cabins/${c.slug}/index.html`, page({
    route, current: '/#cabins',
    title: `${c.name} · ${B.city} Cabin | ${B.short}`,
    desc: c.metaDesc || `${c.name}: ${facts.join(', ')}. A family cabin in the ${B.city} pines, 45 minutes from Yellowstone. Book direct with the owner.`,
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
    return items.length ? `<ul class="cards cards--3">${list(items, p => guideCard(p, { photo: true }))}</ul><p class="empty-season" hidden>Nothing in this chapter for that season. Try another.</p>` : '';
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
    <ul class="days">${list(G.DAYS, d => `<li class="day reveal" data-seasons="${(d.seasons || ['summer', 'fall', 'spring']).join(' ')}"><h3>${esc(d.title)}</h3><p class="drive">${esc(d.driveNote)}</p><p style="margin-top:.5rem">${esc(d.summary)}</p><ol>${list(d.stops, s => `<li>${esc(s)}</li>`, '')}</ol>${d.note ? `<p class="tip">${esc(d.note)}</p>` : ''}</li>`)}</ul>` : ''}
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
    ${mapBlock({ parent: 'h1', big: true })}
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

/* ---- checkout (the QR code inside each cabin points here; never indexed) ---------- */
{
  const X = C.checkout;
  const trail = [['Home', '/'], ['Checkout guide', '/checkout/']];
  emit('checkout/index.html', page({
    route: '/checkout/', index: false, title: `Checkout Guide | ${B.short}`,
    desc: `How to check out of your ${B.name} cabin in ${B.city}, ${B.state}.`,
    ld: [crumbsLd(trail)], body: `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">For guests</span>
  <h1 style="margin-top:.9rem">Checking out</h1>
  <p class="lede">Which cabin are you in?</p>
  <p style="margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:.6rem">${list(C.cabins, c => `<a class="btn btn--book" href="/checkout/${c.slug}/">${esc(c.name)}</a>`, '')}</p>
</div>`,
  }), { route: '/checkout/', sitemap: false });

  for (const c of C.cabins) {
    const route = `/checkout/${c.slug}/`;
    const t = [...trail, [c.name, route]];
    emit(`checkout/${c.slug}/index.html`, page({
      route, index: false, title: `Checking Out of ${c.name} | ${B.short}`,
      desc: `Checkout steps for ${c.name}, ${B.city}, ${B.state}.`,
      ld: [crumbsLd(t)], body: `
<div class="wrap page-head">
  ${crumbsNav(t)}
  <span class="sign">${esc(c.name)}</span>
  <h1 style="margin-top:.9rem">Checking out</h1>
  <p class="lede">${esc(X.lede)}</p>
</div>
<section style="padding-top:0">
  <div class="wrap">
    <ol class="checklist">${list(c.checkout, st => `<li><div><b>${esc(st.title)}</b>${st.detail ? `<p>${esc(st.detail)}</p>` : ''}</div></li>`, '')}</ol>
    <div class="book-slot" style="margin-top:2.5rem">
      <h2 style="font-size:var(--step-2)">${esc(X.returnHead)}</h2>
      <p>${esc(X.returnLede)}</p>
      <div class="row"><a class="btn btn--book" href="/cabins/${c.slug}/#book">Book your next stay</a>${phone ? `<a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}Call Robyn</a>` : ''}</div>
    </div>
  </div>
</section>`,
    }), { route, sitemap: false });
  }
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

/* ---- pamphlet: Letter tri-fold for each cabin (print, never indexed) ------------------
   Outside: [inside flap | back | cover]   Inside: [Yellowstone | seasons | safety + QR]
   PDF: node tools/pdf.mjs  →  ../Docs/Wilderness-Escape-Pamphlet-DRAFT.pdf            */
{
  const blank = s => `<mark class="blank">[${esc(s)}]</mark>`;
  const sup = name => G.SUPPLIES.find(x => x.name === name);
  const near = [
    ['Elk Creek Station', 'Groceries, gas, propane, ATM'],
    ['Island Park Liquor and Sports', 'Liquor store, Wed to Sat'],
    ['Island Park Post Office', 'Closed Sundays'],
    ['Sam Patch Co. Grocer and Sundries', 'Biggest grocery, firewood, licenses'],
  ].map(([n, what]) => ({ name: n, what, drive: (sup(n) || {}).drive }));
  const seasonsBlock = G.SEASONS.map(s => {
    const ids = (C.home.picks || {})[s.id] || [];
    return `<div class="p-season"><h3>${esc(s.label)}</h3><ul>${ids.map(id => placeById(id)).filter(Boolean).map(p =>
      `<li><span>${esc(p.short || p.name)}</span>${p.drive != null ? `<b>${drive(p.drive)}</b>` : ''}</li>`).join('')}</ul></div>`;
  }).join('');
  const qr = f => read(`assets/qr/${f}.svg`).replace('<svg ', '<svg aria-hidden="true" ');
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Guest pamphlet (print) | ${esc(B.short)}</title>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/main.css">
<style>
  @page{ size: 11in 8.5in; margin: 0 }
  html, body{ background: #D9D4C7 }
  body{ margin: 0; font-size: 8.4pt; line-height: 1.38 }
  .sheet{ inline-size: 11in; block-size: 8.5in; margin: .4in auto; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr);
          background: var(--bg); overflow: hidden; break-after: page }
  .sheet:last-child{ break-after: auto }
  @media print{ html, body{ background: #fff } .sheet{ margin: 0 } }
  .panel{ padding: .34in .32in; display: flex; flex-direction: column; gap: .13in; min-inline-size: 0; overflow: hidden }
  .panel + .panel{ border-inline-start: 1px dashed #CFC8B6 }
  .panel h2{ font-size: 15pt; line-height: 1.05 }
  .panel h3{ font: 700 9pt/1.2 var(--font-display) }
  .panel p, .panel li{ max-inline-size: none }
  .sign{ font-size: 6.8pt }
  .rows{ list-style: none; display: grid; border-block-start: 1px solid var(--line) }
  .rows li{ display: grid; grid-template-columns: 1fr auto; gap: .08in; padding-block: .05in; border-block-end: 1px solid var(--line) }
  .rows small{ display: block; color: var(--fg-2); font-size: 7.4pt }
  .rows b, .p-season b{ color: var(--marker); font-variant-numeric: tabular-nums; white-space: nowrap }
  .p-season ul{ list-style: none; display: grid; gap: .02in }
  .p-season li{ display: flex; justify-content: space-between; gap: .1in; border-block-end: 1px dotted var(--line); padding-block: .02in }
  .p-season + .p-season{ margin-block-start: .02in }
  .note{ font-size: 7.4pt; color: var(--fg-2) }
  .box{ padding: .1in .12in; background: var(--bg-2); border-radius: 3px }
  .blank{ background: #FFE58A; color: #17231D; padding: 0 .04in }
  .qrs{ display: grid; grid-template-columns: 1fr 1fr; gap: .14in; margin-block-start: auto }
  .qr{ display: grid; gap: .04in; justify-items: center; text-align: center; font-weight: 600; font-size: 7.6pt }
  .qr svg{ inline-size: 1.15in; block-size: 1.15in }
  .rules-p{ list-style: none; display: grid; gap: .05in }
  .rules-p li{ padding-inline-start: .14in; position: relative }
  .rules-p li::before{ content: ""; position: absolute; left: 0; top: .055in; inline-size: .06in; block-size: .06in; background: var(--fg) }
  .cover{ padding: 0; background: var(--dusk); color: var(--dusk-fg); position: relative }
  .cover img{ inline-size: 100%; block-size: 5.3in; object-fit: cover; object-position: 50% 12% }
  .cover .in{ padding: .26in .32in .3in; display: grid; gap: .1in }
  .cover h1{ font-size: 25pt; color: var(--dusk-fg) }
  .cover p{ color: var(--dusk-fg-2) }
  .cover .draft{ position: absolute; top: .12in; right: .12in; background: var(--warn); color: #fff; font-size: 7pt; padding: .03in .08in; border-radius: 2px }
  .back-cta{ display: grid; gap: .1in; justify-items: start }
  .back-cta svg{ inline-size: 1.3in; block-size: 1.3in }
</style>
</head>
<body>
<main>
<section class="sheet" aria-label="Outside">
  <div class="panel">
    <span class="sign">Close to the cabins</span>
    <h2>Groceries, gas and help</h2>
    <ul class="rows">${near.map(n => `<li><span>${esc(n.name)}<small>${esc(n.what)}</small></span>${n.drive != null ? `<b>${drive(n.drive)}</b>` : ''}</li>`).join('')}
      <li><span>Island Park Medical Clinic<small>By Pond's Lodge. Weekdays 8 to 5, walk-ins</small></span><b>10 min</b></li>
      <li><span>Nearest ER: Madison Memorial<small>Rexburg. Call 911 in an emergency</small></span><b>1 hr 15 min</b></li>
    </ul>
    <p class="note">There is no pharmacy in Island Park. The nearest are in West Yellowstone and Ashton, weekdays only.</p>
    <div class="box"><h3>Wi-Fi</h3><p>Network ${blank('network name')}<br>Password ${blank('password')}</p></div>
    <p class="note">Cell service is patchy in the forest. Download offline maps before you head out.</p>
  </div>
  <div class="panel">
    <span class="sign">Book direct</span>
    <h2>Come back in another season</h2>
    <p>Island Park is a different place in every season. Returning guests can book directly with Robyn: no platform fees, and you deal with the owner.</p>
    <div class="back-cta">${qr('home')}<b>${esc(B.domain.replace(/^www\./, ''))}</b></div>
    <div class="box">
      <p>${phone ? esc(phone) : blank('phone')}<br>${email ? esc(email) : blank('email')}</p>
      <p class="note" style="margin-top:.05in">${esc(B.street)}, ${esc(B.city)}, ${esc(B.region)} ${esc(B.zip)}</p>
    </div>
    <p class="note" style="margin-top:auto">Guide facts checked September 2026. Hours, fees and road openings change; check before you go.</p>
  </div>
  <div class="panel cover">
    ${SAMPLE ? '<span class="draft">Draft</span>' : ''}
    ${pic('teal-cabins-drive', { sizes: '4in', alt: C.photos['teal-cabins-drive'].alt }).replace(' loading="lazy" decoding="async"', '')}
    <div class="in">
      <span class="sign">${esc(B.city)}, ${esc(B.state)}</span>
      <h1>${esc(B.short)}</h1>
      <p>Your guide to Island Park and Yellowstone, with drive times from the cabins.</p>
    </div>
  </div>
</section>

<section class="sheet" aria-label="Inside">
  <div class="panel">
    <span class="sign">Yellowstone</span>
    <h2>In through the West Entrance</h2>
    <ul class="rows">
      <li><span>West Entrance<small>Cars mid-April to Oct 31. Mid-Dec to mid-March, snowcoach and snowmobile tours only</small></span><b>45 min</b></li>
      <li><span>Entrance pass<small>$35 per vehicle for 7 days. No reservation needed (2026)</small></span><b>$35</b></li>
    </ul>
    <h3>Day plans</h3>
    <ul class="rows">${G.DAYS.slice(0, 4).map(d => `<li><span>${esc(d.title)}<small>${esc(d.stops[d.stops.length - 1])}</small></span><b>${esc(d.driveNote.replace(/^About /, '').replace(/ each way.*$/, '').replace(/ to .*$/, ''))}</b></li>`).join('')}</ul>
    <p class="note">Times are one way, with no stops or traffic. Be at the gate before 7 am, or come in after noon. No gas at Madison or Norris: fill up in West Yellowstone.</p>
  </div>
  <div class="panel">
    <span class="sign">Island Park</span>
    <h2>What to do, by season</h2>
    ${seasonsBlock}
  </div>
  <div class="panel">
    <span class="sign">Wildlife</span>
    <h2>How close is too close</h2>
    <ul class="rules-p">${G.PARK_RULES.slice(0, 5).map(r => `<li>${esc(r)}</li>`).join('')}</ul>
    <div class="qrs">
      <div class="qr">${qr('map')}<span>Map and full guide</span></div>
      <div class="qr">${qr('checkout')}<span>Checking out</span></div>
    </div>
  </div>
</section>
</main>
</body>
</html>
`;
  emit('print/pamphlet/index.html', html, { sitemap: false });
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
