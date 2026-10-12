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
/* keep "Wi-Fi" on one line in headings (it was breaking at the hyphen on phones) */
const nobr = html => html.replace(/Wi-Fi/g, '<span class="nobr">Wi-Fi</span>');
const SITE = `https://${C.business.domain}`;
const abs = p => SITE + p;
/* link previews: the Vercel share link until launch, the real domain after */
const SHARE = (!C.launched && C.previewOrigin) ? C.previewOrigin.replace(/\/$/, '') : SITE;
const shareUrl = p => SHARE + p;
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
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.8a15 15 0 0 1 20 0M5 12.6a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0"/><circle cx="12" cy="19.8" r="1" fill="currentColor"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
};

/* photos: every <img> goes through here so alt text and sizes come from config */
function pic(key, { sizes = '100vw', eager = false, cls = '', alt } = {}) {
  const p = C.photos[key];
  if (!p) throw new Error(`photo "${key}" is not registered in CONFIG.photos`);
  const h = Math.round(1200 * p.h / p.w);
  const base = `/assets/photos/${key}`;
  return `<img src="${base}-1200.jpg" srcset="${base}-640.webp 640w, ${base}-1200.webp 1200w, ${base}-2400.webp 2400w" sizes="${sizes}" width="1200" height="${h}" alt="${esc(alt ?? p.alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${cls ? ` class="${cls}"` : ''}${p.focus ? ` style="object-position:${p.focus}"` : ''}>`;
}

/* Robyn's own photos on her OwnerRez photo host: Medium is 600x400,
   Large 1200x800, every one 3:2. */
const orSrc = (id, size) => `https://uc.orez.io/i/${id}-${size}`;
function orImg(g, { sizes = '100vw', eager = false, alt } = {}) {
  return `<img src="${orSrc(g.id, 'Medium')}" srcset="${orSrc(g.id, 'Medium')} 600w, ${orSrc(g.id, 'Large')} 1200w" sizes="${sizes}" width="1200" height="800" alt="${esc(alt ?? g.alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}
const cabinBySlug = slug => C.cabins.find(c => c.slug === slug);
const orById = id => { for (const c of C.cabins) { const g = (c.gallery || []).find(x => x.id === id); if (g) return g; } throw new Error(`OwnerRez photo ${id} is not in any cabin gallery`); };
/* a cabin's lead photo: one of our shoot keys, or one of her OwnerRez ids */
const cabinLead = (c, opts) => C.photos[c.lead] ? pic(c.lead, opts) : orImg(orById(c.lead), opts);
const cabinLeadHref = c => C.photos[c.lead] ? `/assets/photos/${c.lead}-2400.webp` : orSrc(c.lead, 'Large');
const cabinLeadAlt = c => C.photos[c.lead] ? C.photos[c.lead].alt : orById(c.lead).alt;
const cabinFacts = c => [c.sleeps && `Sleeps ${c.sleeps}`, c.bedrooms != null && `${c.bedrooms} bedroom${c.bedrooms === 1 ? '' : 's'}`, c.baths != null && `${c.baths} bath${c.baths === 1 ? '' : 's'}`, c.sqft && `${c.sqft.toLocaleString('en-US')} sq ft`].filter(Boolean);

/* reviews: real, five stars each, attributed and dated (CONFIG.reviews) */
const REV = (C.reviews && C.reviews.items) || [];
const stars = `<span class="stars" role="img" aria-label="5 out of 5 stars">${icon.star.repeat(5)}</span>`;
const reviewCard = (r, { cabin = true } = {}) => {
  const c = cabinBySlug(r.cabin);
  return `<li class="review-card" data-cabin="${esc(r.cabin)}"><figure>
        ${stars}
        <blockquote><p>${esc(r.text)}</p></blockquote>
        <figcaption><b>${esc(r.name)}</b>${cabin && c ? ` · stayed at <a href="/cabins/${c.slug}/" translate="no">${esc(c.name)}</a>` : ''} · ${esc(r.when)}</figcaption>
      </figure></li>`;
};

/* ---- shell ---------------------------------------------------------------- */
const NAV = [
  ['/#cabins', 'The cabins'],
  ['/guide/', 'Things to do'],
  ['/map/', 'Map'],
  ['/reviews/', 'Reviews'],
  ['/faq/', 'FAQ'],
];
const LOGO = C.logo;

function header(current) {
  const links = list(NAV, ([href, label]) =>
    `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`, '');
  return `<a href="#main" class="skip">Skip to content</a>
${SAMPLE ? '<div class="sample-flag" role="note">Draft for review · sample content, not final</div>' : ''}
<div class="topbar"><div class="wrap"><span><b>Office</b> ${esc(B.street)}, ${esc(B.city)}, ${esc(B.state)} ${esc(B.zip)}</span>${email ? `<a href="mailto:${esc(email)}">${icon.mail}${esc(email)}</a>` : ''}</div></div>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="/" translate="no"><img src="${LOGO.src}" srcset="${LOGO.srcset}" sizes="(max-width: 40rem) 62px, 77px" width="${LOGO.w}" height="${LOGO.h}" alt=""><span class="brand__text"><b>${esc(B.short)}</b><span>Cabins in ${esc(B.city)}, ${esc(B.state)}</span></span></a>
    <nav class="nav" aria-label="Main">${links}</nav>
    <a class="btn btn--book head-book" href="/book/"${current === '/book/' ? ' aria-current="page"' : ''}>${icon.cal}Book now</a>
    <button class="btn btn--quiet menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
  </div>
  <nav id="menu" class="menu" aria-label="Menu"><div class="wrap">${links}${email ? `<a href="mailto:${esc(email)}">Email us</a>` : ''}</div></nav>
</header>`;
}

function footer() {
  return `<footer class="site-foot on-dusk">
  <div class="wrap">
    <div class="cols">
      <div class="stack">
        <a class="foot-logo" href="/"><img src="/assets/logo/logo-320.webp" width="${LOGO.w}" height="${LOGO.h}" alt="${esc(B.name)} home" loading="lazy" decoding="async"></a>
        <address><b>Office</b><br>${esc(B.street)}<br>${esc(B.city)}, ${esc(B.state)} ${esc(B.zip)}</address>
        ${email ? `<p><a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
      </div>
      <div>
        <h2 class="foot-h">Stay</h2>
        <ul>${list(C.cabins, c => `<li><a href="/cabins/${c.slug}/">${esc(c.name)}</a></li>`, '')}<li><a href="/book/">Book now</a></li><li><a href="/reviews/">Reviews</a></li><li><a href="/faq/">FAQ</a></li><li><a href="/checkout/">Checkout guide</a></li></ul>
      </div>
      <div>
        <h2 class="foot-h">Explore</h2>
        <ul><li><a href="/guide/">Things to do</a></li><li><a href="/map/">Yellowstone map</a></li><li><a href="/guide/#food">Restaurants</a></li><li><a href="/guide/#supplies">Groceries</a></li><li><a href="/guide/#shows">Theatre and shows</a></li></ul>
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

/* the favicon is the mountain scene from Robyn's logo */
const ICONS = `<link rel="icon" href="/assets/logo/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/logo/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/assets/logo/apple-touch-icon.png">`;

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
<meta name="theme-color" content="#FFFFFF">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(B.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${shareUrl(route)}">
<meta property="og:image" content="${shareUrl('/assets/og.jpg')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(C.photos[C.home.heroPhoto].alt)}">
<meta name="twitter:card" content="summary_large_image">
${ICONS}
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
   noscript line and an email link that always works. (No phone:
   Robyn wants guests booking on the site, 7 Oct 2026.)           */
const OR = C.booking || {};
const orWidget = (type, widgetId, propertyKey) => widgetId ? `<div class="or-widget or-widget--${type.toLowerCase().replace(/[^a-z]+/g, '-')}"><div class="ownerrez-widget" data-widget-type="${type}" data-widgetId="${widgetId}"${propertyKey ? ` data-propertyId="${propertyKey}"` : ''}></div></div>` : '';
const contactRow = subject => email ? `<div class="row">
        <a class="btn btn--quiet" href="mailto:${esc(email)}?subject=${encodeURIComponent(subject)}">${icon.mail}Email us</a>
      </div>` : '';
function bookSlot(cabin, { heading = true } = {}) {
  const widget = cabin
    ? orWidget('Booking/Inquiry', (OR.perCabin || {}).booking, cabin.ownerrez && cabin.ownerrez.key)
    : orWidget('Booking/Inquiry', (OR.all || {}).booking);
  return `<div class="book-slot">
      ${heading ? `<h3>${cabin ? `Book ${esc(cabin.name)}` : 'Pick your dates'}</h3>` : ''}
      ${widget || '<p>Online booking with live availability connects here at launch.</p>'}
      <noscript><p>The booking calendar needs JavaScript. Email us for dates.</p></noscript>
      <p class="note">Booking both cabins, or have a question first?</p>
      ${contactRow(`Dates${cabin ? ` for ${cabin.name}` : ''}`)}
    </div>`;
}

/* the photo gallery on a cabin page: every photo opens in the viewer
   (main.js); with no JS each link opens the large photo itself */
const galleryLink = (href, alt, img, group) => `<a href="${href}" data-lightbox="${group}" data-caption="${esc(alt)}">${img}</a>`;

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
    const col = (G.CATEGORIES[p.cat] || {}).color;
    return `<g class="pin pin--${p.cat}" data-id="${p.id}" data-cat="${p.cat}" data-xy="${x},${y}" transform="translate(${x} ${y})"${col ? ` style="--c:${col}"` : ''} role="button" tabindex="0" aria-label="${esc(p.name)}${p.drive != null ? `, ${drive(p.drive)} from the cabins` : ''}"><circle r="7"/>${lab}</g>`;
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
        <figure><a href="/cabins/${c.slug}/" tabindex="-1" aria-hidden="true">${cabinLead(c, { sizes: '(min-width: 40rem) 45vw, 100vw' })}</a></figure>
        <h3 translate="no"><a href="/cabins/${c.slug}/">${esc(c.name)}</a></h3>
        <ul class="facts">${cabinFacts(c).map(f => `<li>${f}</li>`).join('')}</ul>
        <p class="blurb">${esc(c.summary)}</p>
        <div class="row"><a class="btn btn--book" href="/book/#${c.slug}">${icon.cal}Book now</a><a class="btn btn--quiet" href="/cabins/${c.slug}/">See the cabin</a></div>
      </li>`);

  const policies = (C.policies || []).filter(p => p.value);
  const factsList = cls => H.facts && H.facts.length ? `<ul class="hero__facts ${cls}">${list(H.facts, f => `<li>${f}</li>`, '')}</ul>` : '';
  const BC = H.bookCard || {};

  /* close to the cabins: names from FOOD/SUPPLIES, ids from PLACES */
  const N = H.nearby || {};
  const byName = (arr, name) => { const x = arr.find(r => r.name === name); if (!x) throw new Error(`nearby "${name}" not found`); return x; };
  const nearRow = (name, where, min) => `<li><span class="name">${esc(name)}<span class="sub">${esc(where)}</span></span>${min != null ? `<span class="t">${drive(min)}</span>` : ''}</li>`;
  const nearCol = (head, rows, href, more) => `<div class="near">
        <h3>${head}</h3>
        <ul class="near__list">${rows}</ul>
        <p><a href="${href}">${more}</a></p>
      </div>`;
  const nearbyHtml = (N.groceries || N.food || N.shows) ? `<div class="nearby">
      ${nearCol('Groceries', list(N.groceries, n => { const s = byName(G.SUPPLIES, n); return nearRow(s.name, s.town, s.drive); }, ''), '/guide/#supplies', 'Groceries, gas and supplies')}
      ${nearCol('Restaurants', list(N.food, n => { const s = byName(G.FOOD, n); return nearRow(s.name, s.town, s.drive); }, ''), '/guide/#food', 'Every restaurant in the guide')}
      ${nearCol('Theatre', list(N.shows, id => { const p = placeById(id); if (!p) throw new Error(`nearby show "${id}" not in PLACES`); return nearRow(p.name, p.area, p.drive); }, ''), '/guide/#shows', 'Shows and rainy days')}
    </div>` : '';

  const homeFaq = (C.faq || []).filter(f => f.home);
  const homeReviews = REV.filter(r => r.home);

  const body = `
<section class="hero on-dusk" aria-labelledby="hero-h" style="--hero-pos:${esc(H.heroPos)};--descent-origin:${esc(H.descentOrigin)};--hero-pos-m:${esc(H.heroPosMobile)};--descent-origin-m:${esc(H.descentOriginMobile)}">
  <div class="hero__bg">${pic(H.heroPhoto, { eager: true })}</div>
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <div class="hero__head">
        <span class="sign">${esc(H.welcome)}</span>
        <h1 id="hero-h">${esc(H.h1)}</h1>
      </div>
      <p class="hero__lede">${esc(H.lede)}</p>
      <div class="hero__actions">
        <a class="btn btn--book btn--big" href="/book/">${icon.cal}Book now</a>
        <a class="btn btn--quiet" href="#cabins">See the cabins</a>
      </div>
      ${factsList('hero__facts--in')}
    </div>
    <aside class="hero-book" aria-label="Book a cabin">
      <span class="sign">Book online</span>
      <p class="hero-book__head">${esc(BC.head || 'Book your stay')}</p>
      <ul class="hero-book__cabins">${list(C.cabins, c => `<li><a href="/book/#${c.slug}">${cabinLead(c, { sizes: '96px', alt: '' })}<span><b translate="no">${esc(c.name)}</b><small>Sleeps ${c.sleeps} · ${c.bedrooms} bedrooms</small></span>${icon.arrow}</a></li>`, '')}</ul>
      <a class="btn btn--book btn--big" href="/book/">${icon.cal}Book now</a>
      ${BC.note ? `<p class="note">${esc(BC.note)}</p>` : ''}
    </aside>
  </div>
</section>
<div class="hero-after on-dusk">
  <div class="wrap">
    <p class="hero__lede">${esc(H.lede)}</p>
    ${factsList('hero__facts--after')}
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
    ${(H.inside || []).length ? `<h3 class="inside-head">${esc(H.insideHead || 'A look inside')}</h3>
    <ul class="inside">${list(H.inside, ([slug, id]) => { const c = cabinBySlug(slug); const g = orById(id); return `<li><a href="/cabins/${slug}/">${orImg(g, { sizes: '(min-width: 64rem) 25vw, (min-width: 40rem) 33vw, 50vw' })}<span translate="no">${esc(c.name)}</span></a></li>`; }, '')}</ul>` : ''}
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

${nearbyHtml ? `<section id="nearby" aria-labelledby="nearby-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Close to the cabins</span>
      <h2 id="nearby-h" class="reveal">${esc(H.nearbyHead)}</h2>
      <p>${esc(H.nearbyLede)}</p>
    </div>
    ${nearbyHtml}
  </div>
</section>` : ''}

<section class="raised" id="season" aria-labelledby="season-h">
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

${homeReviews.length ? `<section id="reviews" aria-labelledby="reviews-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Guest reviews</span>
      <h2 id="reviews-h" class="reveal">Five-star stays in the pines</h2>
      <p>Real guests, in their own words. Every review on this site is five stars.</p>
    </div>
    <ul class="review-grid">${list(homeReviews, r => reviewCard(r))}</ul>
    <p style="margin-top:2rem"><a class="btn btn--quiet" href="/reviews/">Read all ${REV.length} reviews ${icon.arrow}</a></p>
  </div>
</section>` : ''}

<section class="raised" id="plan" aria-labelledby="plan-h">
  <div class="wrap plan">
    <div>
      <div class="sec-head">
        <span class="sign">Plan your stay</span>
        <h2 id="plan-h" class="reveal">Questions guests ask</h2>
      </div>
      ${policies.length ? `<dl class="policy">${list(policies, p => `<div><dt>${esc(p.label)}</dt><dd>${esc(p.value)}</dd></div>`, '')}</dl>` : ''}
    </div>
    <div>
      <div class="faq">${list(homeFaq, f => `<details${f.open ? ' open' : ''}><summary>${esc(f.q)}</summary><div><p>${esc(f.a)}</p></div></details>`, '')}</div>
      <p style="margin-top:1.5rem"><a class="btn btn--quiet" href="/faq/">All questions ${icon.arrow}</a></p>
    </div>
  </div>
</section>

<section class="dusk on-dusk cta" id="book" aria-labelledby="book-h">
  <div class="wrap cta__grid">
    <div class="sec-head">
      <span class="sign">Book online</span>
      <h2 id="book-h" class="reveal">${esc(H.bookHead || 'Book your stay')}</h2>
      <p>${esc(H.bookLede)}</p>
      <div class="hero__actions"><a class="btn btn--book btn--big" href="/book/">${icon.cal}Book now</a><a class="btn btn--quiet" href="/book/#dates">See open dates</a></div>
    </div>
    ${H.hosts ? `<div class="hosts"><h3>Your hosts</h3><p>${esc(H.hosts)}</p></div>` : ''}
  </div>
</section>`;

  const ld = [{
    '@context': 'https://schema.org', '@type': 'LodgingBusiness',
    name: B.name, url: abs('/'), image: abs('/assets/og.jpg'), logo: abs(LOGO.png),
    ...(phone ? { telephone: phone } : {}), ...(email ? { email } : {}),
    address: { '@type': 'PostalAddress', streetAddress: B.street, addressLocality: B.city, addressRegion: B.region, postalCode: B.zip, addressCountry: 'US' },
    areaServed: `${B.city}, ${B.state} and Yellowstone National Park`,
  }];
  emit('index.html', page({
    route: '/', current: '/', title: C.seo.homeTitle, desc: C.seo.homeDesc, ld, body,
    preload: [`<link rel="preload" as="image" imagesrcset="/assets/photos/${H.heroPhoto}-640.webp 640w, /assets/photos/${H.heroPhoto}-1200.webp 1200w, /assets/photos/${H.heroPhoto}-2400.webp 2400w" imagesizes="100vw" fetchpriority="high">`],
  }), { route: '/' });
}

/* ---- cabin pages --------------------------------------------------------------- */
for (const c of C.cabins) {
  const route = `/cabins/${c.slug}/`;
  const trail = [['Home', '/'], [c.name, route]];
  const other = C.cabins.find(x => x.slug !== c.slug);
  const facts = cabinFacts(c);
  const gal = (c.gallery || []).filter(g => g.id !== c.lead);
  const top = gal.slice(0, 4), rest = gal.slice(4);
  const SHOWN = 12;                                  /* the rest open behind "See all" */
  const thumb = g => galleryLink(orSrc(g.id, 'Large'), g.alt, orImg(g, { sizes: '(min-width: 64rem) 16rem, (min-width: 40rem) 30vw, 45vw' }), c.slug);
  const reviews = REV.filter(r => r.cabin === c.slug);
  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">${esc(c.address)}, ${esc(B.city)}</span>
  <h1 style="margin-top:.9rem" translate="no">${esc(c.name)}</h1>
  <ul class="facts" style="margin-top:1rem">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
</div>
<div class="wrap">
  <div class="gallery">${galleryLink(cabinLeadHref(c), cabinLeadAlt(c), cabinLead(c, { sizes: '(min-width: 64rem) 50vw, 100vw', eager: true }), c.slug)}${list(top, g => galleryLink(orSrc(g.id, 'Large'), g.alt, orImg(g, { sizes: '(min-width: 64rem) 25vw, 50vw' }), c.slug), '')}</div>
  <p class="gallery-count"><a href="#photos">See all ${gal.length + 1} photos ${icon.arrow}</a></p>
</div>
<section>
  <div class="wrap cabin-body">
    <div class="stack" style="--stack:1.25rem">
      <h2 class="reveal">${esc(c.headline || 'The cabin')}</h2>
      ${c.intro ? `<p class="cabin-intro">${esc(c.intro)}</p>` : ''}
      ${list(c.description, para => `<p>${esc(para)}</p>`)}
      <p class="note">Sleeps ${c.sleeps}: ${esc(c.beds)}.</p>
      ${C.wifi ? `<div class="wifi-callout wifi-callout--small"><span class="wifi-callout__icon">${icon.wifi}</span><div><h3>${nobr(esc(C.wifi.head))}</h3><p>${nobr(esc(C.wifi.short))}</p></div></div>` : ''}
      ${c.amenities && c.amenities.length ? `<h3 style="margin-top:2rem">What’s here</h3><ul class="amenities">${list(c.amenities, a => `<li>${esc(a)}</li>`, '')}</ul>` : ''}
      ${other ? `<div class="book-slot" style="margin-top:2rem"><h3>Bringing everyone?</h3><p>${esc(other.name)} is right next door and sleeps ${other.sleeps}. Book both and keep the whole group together.</p><p><a class="btn btn--quiet" href="/cabins/${other.slug}/">See ${esc(other.name)} ${icon.arrow}</a></p></div>` : ''}
    </div>
    <aside id="book">${bookSlot(c)}</aside>
  </div>
</section>
${rest.length ? `<section class="photos-sec" id="photos" aria-labelledby="photos-h">
  <div class="wrap">
    <div class="sec-head"><span class="sign">Photos</span><h2 id="photos-h" class="reveal">Every room, inside and out</h2><p>Tap any photo to see it large.</p></div>
    <div class="more-photos">${list(rest.slice(0, SHOWN), thumb, '')}</div>
    ${rest.length > SHOWN ? `<details class="all-photos"><summary class="btn btn--quiet">See ${rest.length - SHOWN} more photos</summary><div class="more-photos">${list(rest.slice(SHOWN), thumb, '')}</div></details>` : ''}
  </div>
</section>` : ''}
<section class="raised" id="dates" aria-labelledby="avail-h">
  <div class="wrap">
    <div class="sec-head"><span class="sign">Availability</span><h2 id="avail-h" class="reveal">Open dates</h2></div>
    ${orWidget('Multiple Month Calendar', (OR.perCabin || {}).calendar, c.ownerrez && c.ownerrez.key)}
    <noscript><p>The calendar needs JavaScript. Email us for dates.</p></noscript>
    <p style="margin-top:1.5rem"><a class="btn btn--book" href="/book/#${c.slug}">${icon.cal}Book ${esc(c.name)}</a></p>
  </div>
</section>
${reviews.length ? `<section aria-labelledby="rev-h">
  <div class="wrap">
    <div class="sec-head"><span class="sign">Guest reviews</span><h2 id="rev-h" class="reveal">What guests say about ${esc(c.name)}</h2></div>
    <ul class="review-grid">${list(reviews.slice(0, 6), r => reviewCard(r, { cabin: false }))}</ul>
    <p style="margin-top:2rem"><a class="btn btn--quiet" href="/reviews/">Read all ${REV.length} reviews ${icon.arrow}</a></p>
  </div>
</section>` : ''}`;
  emit(`cabins/${c.slug}/index.html`, page({
    route, current: '/#cabins',
    title: `${c.name} · ${B.city} Cabin | ${B.short}`,
    desc: c.metaDesc || `${c.name}: ${facts.join(', ')}. A family cabin in the ${B.city} pines, ${B.toYellowstone.replace('min', 'minutes')} from Yellowstone. Book online.`,
    ld: [crumbsLd(trail)], body,
  }), { route });
}

/* ---- book now: the page every "Book now" button lands on --------------------- */
{
  const route = '/book/';
  const trail = [['Home', '/'], ['Book now', route]];
  const policies = (C.policies || []).filter(p => p.value);
  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">Book online</span>
  <h1 style="margin-top:.9rem">Book your stay</h1>
  <p class="lede">Pick your cabin and your dates. You will see your total, with taxes and fees, before you pay, and you book right here on our website.</p>
  <ul class="perks">
    <li><b>No service fees</b><span>No Airbnb or VRBO fees on top</span></li>
    <li><b>See your total first</b><span>Nightly rate, taxes and fees up front</span></li>
    <li><b>${esc(B.toYellowstone)} to Yellowstone</b><span>Self check-in from 4:00 pm</span></li>
    <li><b>Fast Wi-Fi</b><span>Great for video calls and remote work</span></li>
  </ul>
</div>
<section style="padding-top:0" aria-label="Choose a cabin">
  <div class="wrap book-cabins">
    ${list(C.cabins, c => `<article class="book-cabin" id="${c.slug}" aria-labelledby="bk-${c.slug}">
      <figure>${cabinLead(c, { sizes: '(min-width: 64rem) 36rem, 100vw' })}</figure>
      <div class="book-cabin__head">
        <h2 id="bk-${c.slug}" translate="no">${esc(c.name)}</h2>
        <ul class="facts">${cabinFacts(c).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
        <p class="note">${esc(c.summary)} <a href="/cabins/${c.slug}/">See the cabin and photos</a></p>
      </div>
      ${bookSlot(c, { heading: false })}
    </article>`, '')}
  </div>
</section>
<section class="raised" id="dates" aria-labelledby="dates-h">
  <div class="wrap">
    <div class="sec-head"><span class="sign">Availability</span><h2 id="dates-h" class="reveal">Open dates at both cabins</h2><p>Planning a reunion? Find the dates both cabins are open, then book each one.</p></div>
    ${orWidget('Ribbon Calendar', (OR.all || {}).calendar)}
    <noscript><p>The calendar needs JavaScript. Email us for dates.</p></noscript>
  </div>
</section>
<section aria-labelledby="know-h">
  <div class="wrap plan">
    <div>
      <div class="sec-head"><span class="sign">Good to know</span><h2 id="know-h" class="reveal">Before you book</h2></div>
      ${policies.length ? `<dl class="policy">${list(policies, p => `<div><dt>${esc(p.label)}</dt><dd>${esc(p.value)}</dd></div>`, '')}</dl>` : ''}
    </div>
    <div class="stack">
      <div class="faq">${list((C.faq || []).filter(f => f.group === 'booking'), f => `<details><summary>${esc(f.q)}</summary><div><p>${esc(f.a)}</p></div></details>`, '')}</div>
      <p><a class="btn btn--quiet" href="/faq/">All questions ${icon.arrow}</a></p>
    </div>
  </div>
</section>`;
  emit('book/index.html', page({
    route, current: '/book/',
    title: `Book Your Stay in ${B.city} | ${B.short}`,
    desc: `Book Pine Shadows or Wilderness Escape Retreat online: pick your dates, see your total and book online, with no Airbnb or VRBO service fees.`,
    ld: [crumbsLd(trail)], body,
  }), { route });
}

/* ---- reviews ------------------------------------------------------------------ */
{
  const route = '/reviews/';
  const trail = [['Home', '/'], ['Reviews', route]];
  const count = slug => REV.filter(r => r.cabin === slug).length;
  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">Guest reviews</span>
  <h1 style="margin-top:.9rem">Five-star stays in the pines</h1>
  <p class="lede">Reviews from guests who stayed in our cabins, in their own words. Every one of them is five stars.</p>
  <div class="seasons review-filter" role="group" aria-label="Show reviews for" data-review-filter hidden>
    <button type="button" data-cabin="all" aria-pressed="true">All ${REV.length}</button>
    ${list(C.cabins, c => `<button type="button" data-cabin="${c.slug}" aria-pressed="false"><span translate="no">${esc(c.name)}</span> ${count(c.slug)}</button>`, '')}
  </div>
</div>
<section style="padding-top:0" aria-label="Reviews">
  <div class="wrap">
    <ul class="review-grid review-grid--all">${list(REV, r => reviewCard(r))}</ul>
    <p class="note" style="margin-top:2rem">${esc(C.reviews.source)} Updated ${esc(C.reviews.asOf)}.</p>
  </div>
</section>
<section class="dusk on-dusk cta" aria-labelledby="rv-book-h">
  <div class="wrap">
    <div class="sec-head">
      <span class="sign">Book online</span>
      <h2 id="rv-book-h" class="reveal">Your turn in the forest</h2>
      <p>${esc(C.home.bookLede)}</p>
      <div class="hero__actions"><a class="btn btn--book btn--big" href="/book/">${icon.cal}Book now</a></div>
    </div>
  </div>
</section>`;
  emit('reviews/index.html', page({
    route, current: '/reviews/',
    title: `Guest Reviews | ${B.short}`,
    desc: `${REV.length} five-star reviews from guests at Pine Shadows and Wilderness Escape Retreat, our family cabins in ${B.city}, ${B.state}.`,
    ld: [crumbsLd(trail)], body,
  }), { route });
}

/* ---- FAQ -------------------------------------------------------------------------- */
{
  const route = '/faq/';
  const trail = [['Home', '/'], ['FAQ', route]];
  const policies = (C.policies || []).filter(p => p.value);
  const groups = (C.faqGroups || []).map(g => [g, (C.faq || []).filter(f => f.group === g.id)]).filter(([, a]) => a.length);
  const body = `
<div class="wrap page-head">
  ${crumbsNav(trail)}
  <span class="sign">Questions</span>
  <h1 style="margin-top:.9rem">Frequently asked questions</h1>
  <p class="lede">What guests usually ask before they book.${email ? ` Still wondering about something? Email us at <a href="mailto:${esc(email)}">${esc(email)}</a>.` : ''}</p>
</div>
<section style="padding-top:0">
  <div class="wrap plan plan--faq">
    <div class="stack" style="--stack:2.5rem">
      ${C.wifi ? `<div class="wifi-callout"><span class="wifi-callout__icon">${icon.wifi}</span><div><h2>${nobr(esc(C.wifi.head))}</h2><p>${nobr(esc(C.wifi.body))}</p></div></div>` : ''}
      ${groups.map(([g, items]) => `<div><h2 class="faq-group" id="${g.id}">${esc(g.label)}</h2><div class="faq">${list(items, f => `<details open><summary>${esc(f.q)}</summary><div><p>${esc(f.a)}</p></div></details>`, '')}</div></div>`).join('')}
    </div>
    <aside class="faq-aside">
      <h2 class="faq-group">House rules and times</h2>
      ${policies.length ? `<dl class="policy">${list(policies, p => `<div><dt>${esc(p.label)}</dt><dd>${esc(p.value)}</dd></div>`, '')}</dl>` : ''}
      <p style="margin-top:1.5rem"><a class="btn btn--book" href="/book/">${icon.cal}Book now</a></p>
    </aside>
  </div>
</section>`;
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: (C.faq || []).map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  emit('faq/index.html', page({
    route, current: '/faq/',
    title: `Questions About Our ${B.city} Cabins | ${B.short}`,
    desc: `Fast Wi-Fi for remote work, toiletries, the kitchen, air conditioning, booking both cabins, groceries and how far Yellowstone is: answers about our ${B.city} cabins.`,
    ld: [crumbsLd(trail), faqLd], body,
  }), { route });
}

/* ---- guide ------------------------------------------------------------------- */
{
  const route = '/guide/';
  const trail = [['Home', '/'], ['Things to do', route]];
  const chapters = [
    ['yellowstone', 'Yellowstone'], ['island-park', 'Island Park'], ['wildlife', 'Wildlife'],
    ['shows', 'Theatre and shows'], ['food', 'Food'], ['supplies', 'Groceries and supplies'],
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
      <h2 id="sh-h" class="reveal">Theatre, shows and rainy days</h2>
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
      <div class="row"><a class="btn btn--book" href="/book/#${c.slug}">${icon.cal}Book your next stay</a>${phone ? `<a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}Call Robyn</a>` : ''}</div>
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
  <p style="margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:.6rem"><a class="btn btn--book" href="/book/">${icon.cal}Book now</a><a class="btn btn--quiet" href="/#cabins">See the cabins</a><a class="btn btn--quiet" href="/guide/">Things to do</a><a class="btn btn--quiet" href="/map/">Map</a>${phone ? `<a class="btn btn--quiet" href="${telHref(phone)}">${icon.phone}Call Robyn</a>` : ''}</p>
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
  <p><b>What you send us.</b> When you email us, we receive what you include, such as your name, dates and group size.</p>
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
    ['Elk Creek Station', 'Gas, snacks, propane, ATM'],
    ['Island Park Liquor and Sports', 'Liquor store, Wed to Sat'],
    ['Island Park Post Office', 'Closed Sundays'],
    ['Sam Patch Co. Grocer and Sundries', 'Closest grocery store, firewood, licenses'],
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
${ICONS}
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
  .cover .cover-logo{ inline-size: 1.45in; block-size: auto; margin-block-start: -.95in; padding: .1in; background: var(--bg); border-radius: 50%; aspect-ratio: 1; object-fit: contain; position: relative }
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
  </div>
  <div class="panel">
    <span class="sign">Book online</span>
    <h2>Come back in another season</h2>
    <p>Island Park is a different place in every season. Book your next stay on our website, with no Airbnb or VRBO service fees.</p>
    <div class="back-cta">${qr('home')}<b>${esc(B.domain.replace(/^www\./, ''))}</b></div>
    <div class="box">
      <p>${email ? esc(email) : blank('email')}</p>
      <p class="note" style="margin-top:.05in">Office: ${esc(B.street)}, ${esc(B.city)}, ${esc(B.region)} ${esc(B.zip)}</p>
    </div>
    <p class="note" style="margin-top:auto">Guide facts checked September 2026. Hours, fees and road openings change; check before you go.</p>
  </div>
  <div class="panel cover">
    ${SAMPLE ? '<span class="draft">Draft</span>' : ''}
    ${pic('teal-cabins-drive', { sizes: '4in', alt: C.photos['teal-cabins-drive'].alt }).replace(' loading="lazy" decoding="async"', '')}
    <div class="in">
      <img class="cover-logo" src="${LOGO.png}" width="${LOGO.w}" height="${LOGO.h}" alt="${esc(B.name)} logo">
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
      <li><span>West Entrance<small>Cars mid-April to Oct 31. Mid-Dec to mid-March, snowcoach and snowmobile tours only</small></span><b>${drive(placeById('west-yellowstone').drive)}</b></li>
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

Office: ${B.street}, ${B.city}, ${B.region} ${B.zip}
${phone ? `Phone: ${phone}\n` : ''}${email ? `Email: ${email}\n` : ''}Booking: online through this website (OwnerRez booking engine): ${abs('/book/')}

## Pages

- [Home](${abs('/')}): the cabins, where they are, what to do by season, booking
${C.cabins.map(c => `- [${c.name}](${abs(`/cabins/${c.slug}/`)}): ${[c.sleeps && `sleeps ${c.sleeps}`, c.bedrooms != null && `${c.bedrooms} bedrooms`, c.baths != null && `${c.baths} baths`].filter(Boolean).join(', ')}`).join('\n')}
- [Book now](${abs('/book/')}): both cabins' booking forms and availability
- [Reviews](${abs('/reviews/')}): ${REV.length} five-star guest reviews
- [FAQ](${abs('/faq/')}): Wi-Fi, kitchen, toiletries, booking both cabins, groceries, Yellowstone
- [Things to do](${abs('/guide/')}): Yellowstone and ${B.city} guide with drive times, food, groceries, wildlife, events
- [Map](${abs('/map/')}): interactive map of Yellowstone and ${B.city} with the cabins marked
- [Privacy policy](${abs('/privacy/')})
- [Terms of use](${abs('/terms/')})
`);

for (const w of warnings) console.warn('warn:', w);
console.log(`built ${out.length} pages${SAMPLE ? ' (SAMPLE = true, draft flag on)' : ''}`);
if (failed) process.exit(1);
