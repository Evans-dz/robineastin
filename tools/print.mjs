#!/usr/bin/env node
/* ============================================================================
   tools/print.mjs · every printed piece, from the same data files as the site
   (js/config.js, js/places.js), in the site's palette, type and logo:

     1 Pamphlet        Letter tri-fold guest guide (both sides)
     2 Flyers          book your stay · things to do by season
     3 Cabin Signs     per cabin: welcome sign (Wi-Fi + QR) · checkout sign
     4 Welcome Binders per cabin, 15 pages
     5 QR Codes        every code as SVG and PNG, plus a sheet of them all
     6 Guest Messages  OwnerRez automated message drafts (check-in, checkout)

   Writes the print HTML to print/ (kept off the public site by
   .vercelignore), then renders the PDFs into ../Print Materials/ with the
   lab's playwright-core (system Chrome), serving this folder on a spare port.

     cd tools && npm install          once: the qrcode package
     node tools/print.mjs             everything
     node tools/print.mjs --html      print HTML only, no PDFs
     node tools/print.mjs --origin https://robineastin.vercel.app
                                      a test set whose QR codes open that
                                      address, into Print Materials/_Test proofs

   QR codes open the real domain (CONFIG.business.domain), so they only work
   once the domain points at the new site. Don't send anything to the
   printer before launch. The build FAILS on an em dash (polish standard).
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const load = (file, names) =>
  vm.runInContext(`${read(file)}\n;({${names.join(', ')}})`, vm.createContext({}), { filename: file });
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };

let QRCode;
try { QRCode = createRequire(path.join(ROOT, 'tools', 'package.json'))('qrcode'); }
catch { console.error('The qrcode package is missing. Run:  cd tools && npm install'); process.exit(1); }

const { SAMPLE, CONFIG: C } = load('js/config.js', ['SAMPLE', 'CONFIG']);
const G = load('js/places.js', ['SEASONS', 'PLACES', 'DAYS', 'SIGHTS_NOTE', 'WILDLIFE', 'PARK_RULES', 'PARK_FACTS', 'FOOD', 'SUPPLIES', 'EVENTS', 'PRACTICAL']);

/* ---- helpers (the same rules as tools/build.mjs) ------------------------- */
const esc = s => String(s ?? '')
  .replace(/(\w)'(\w)/g, '$1’$2')
  .replace(/(^|[\s(])"(\S)/g, '$1“$2').replace(/(\S)"(?=[\s.,;:)!?]|$)/g, '$1”')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const NB = ' ';
const drive = min => {
  if (min == null) return '';
  if (min < 60) return `${min}${NB}min`;
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}${NB}hr${m ? `${NB}${m}${NB}min` : ''}`;
};
const list = (arr, fn, sep = '') => (arr || []).map(fn).join(sep);
const B = C.business;
const email = C.contact.email;
const SITE = `https://${B.domain}`;
const DOMAIN = B.domain.replace(/^www\./, '');
const ORIGIN = arg('origin', SITE).replace(/\/$/, '');
const TEST = ORIGIN !== SITE;
const OUT = path.join(ROOT, '..', 'Print Materials', TEST ? '_Test proofs' : '');
const NO_PDF = process.argv.includes('--html');
const warnings = [];

const placeById = id => G.PLACES.find(p => p.id === id);
const picks = season => ((C.home.picks || {})[season] || []).map(placeById).filter(Boolean);
const policy = label => (C.policies.find(p => p.label === label) || {}).value;
const practical = label => G.PRACTICAL.find(p => p.label === label);
const parkFact = label => G.PARK_FACTS.find(p => p.label === label);
const supply = name => G.SUPPLIES.find(x => x.name === name) || {};
const garbage = c => (c.checkout.find(s => /garbage/i.test(s.title)) || {}).detail;
/* the guide's pharmacy note reads "There is none", which needs its subject on paper */
const pharmacy = () => practical('Pharmacy').value.replace(/^There is none/, 'There is no pharmacy');
/* a cabin's own photo whose alt text matches, for the binder's quieter pages */
const galleryPhoto = (c, re, not = []) => (c.gallery || []).find(g => re.test(g.alt) && !not.includes(g.id));
const cabinFacts = c => [c.sleeps && `Sleeps ${c.sleeps}`, c.bedrooms != null && `${c.bedrooms} bedrooms`, c.baths != null && `${c.baths} baths`, c.sqft && `${c.sqft.toLocaleString('en-US')} sq ft`].filter(Boolean);
const fill = (s, c) => s.replace(/\{cabin\}/g, c.name);
/* "Book on our website: no Airbnb or VRBO service fees." without its lead-in, after a line that already says book */
const noFees = () => { const t = C.home.bookCard.note.split(': ').pop(); return t[0].toUpperCase() + t.slice(1); };

/* photos: our shoot at 2400 px (about 280 dpi across a Letter page), and
   Robyn's own from her OwnerRez photo host at 1200 x 800 (Large).
   Chrome puts WebP into a PDF uncompressed (a 48 MB binder), so print uses
   JPEG: the site's 1200 px JPEG where a photo prints small (300+ dpi up to
   4 inches wide), and for full-width covers ({ big: true }) a JPEG copy of
   the 2400 px photo, made with macOS sips into print/img/ (gitignored)
   whenever the WebP is newer. */
const printJpeg = key => {
  const src = path.join(ROOT, 'assets', 'photos', `${key}-2400.webp`);
  const out = path.join(ROOT, 'print', 'img', `${key}-2400.jpg`);
  if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(src).mtimeMs) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70', src, '--out', out], { stdio: 'ignore' });
  }
  return `/print/img/${key}-2400.jpg`;
};
const photo = (key, { alt, pos, cls, big = false } = {}) => {
  const p = C.photos[key];
  if (!p) throw new Error(`photo "${key}" is not registered in CONFIG.photos`);
  return `<img${cls ? ` class="${cls}"` : ''} src="${big ? printJpeg(key) : `/assets/photos/${key}-1200.jpg`}" alt="${esc(alt ?? p.alt)}" style="object-position:${pos || p.focus || '50% 50%'}">`;
};
const orById = id => { for (const c of C.cabins) { const g = (c.gallery || []).find(x => x.id === id); if (g) return g; } throw new Error(`OwnerRez photo ${id} is not in any cabin gallery`); };
const orPhoto = (id, { pos } = {}) => `<img src="https://uc.orez.io/i/${id}-Large" alt="${esc(orById(id).alt)}"${pos ? ` style="object-position:${pos}"` : ''}>`;
const lead = (c, opts) => C.photos[c.lead] ? photo(c.lead, opts) : orPhoto(c.lead, opts);
const LOGO = C.logo.png;
const logoImg = (cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="${LOGO}" width="${C.logo.w}" height="${C.logo.h}" alt="${esc(B.name)} logo">`;
const draft = SAMPLE ? '<span class="draft">Draft for review</span>' : '';
const wifiIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.8a15 15 0 0 1 20 0M5 12.6a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0"/><circle cx="12" cy="19.8" r="1" fill="currentColor"/></svg>';

/* ---- QR codes ------------------------------------------------------------------
   Navy ink on a white plate with a 3-module quiet zone, rounded finder eyes.
   Error correction M keeps the longest address (a cabin's checkout page) at
   37 modules, so codes stay easy to scan at an inch wide. No logo in the
   middle: from version 7 up that would cover an alignment pattern.         */
const INK = '#16233A';
const CODES = new Map();
let piece = '';                                   /* what is being built, for "printed on" */
const code = (id, label, file, target, kind = 'url') =>
  CODES.set(id, { id, label, file, kind, route: kind === 'url' ? target : null, data: kind === 'url' ? ORIGIN + target : target, used: new Set() });
code('book', 'Book your next stay', 'Book your next stay', '/book/');
code('guide', 'Things to do', 'Things to do', '/guide/');
for (const s of G.SEASONS) code(`season-${s.id}`, `${s.label} things to do`, `Things to do - ${s.label}`, `/guide/?season=${s.id}`);
code('map', 'Yellowstone and Island Park map', 'Map', '/map/');
code('yellowstone', 'Yellowstone guide', 'Yellowstone guide', '/guide/#yellowstone');
code('wildlife', 'Wildlife', 'Wildlife', '/guide/#wildlife');
code('shows', 'Shows and events', 'Shows and events', '/guide/#shows');
code('food', 'Restaurants', 'Restaurants', '/guide/#food');
code('supplies', 'Groceries, gas and supplies', 'Groceries and supplies', '/guide/#supplies');
code('practical', 'Safety and practical notes', 'Safety and practical notes', '/guide/#practical');
code('faq', 'Questions and answers', 'FAQ', '/faq/');
code('checkin', 'Check-in guide', 'Check-in guide (both cabins)', '/checkin/');
code('checkout', 'Checkout guide', 'Checkout guide (both cabins)', '/checkout/');
const wifiEsc = s => String(s).replace(/([\\;,:"])/g, '\\$1');
for (const c of C.cabins) {
  code(`cabin-${c.slug}`, c.name, `${c.name} - Cabin page`, `/cabins/${c.slug}/`);
  code(`checkin-${c.slug}`, `${c.name}: check-in`, `${c.name} - Check-in`, `/checkin/${c.slug}/`);
  code(`checkout-${c.slug}`, `${c.name}: checkout`, `${c.name} - Checkout`, `/checkout/${c.slug}/`);
  const w = c.wifiNetwork || {};
  if (w.name) code(`wifi-${c.slug}`, `${c.name} Wi-Fi: scan to join`, `${c.name} - Wi-Fi join`, `WIFI:T:${w.password ? 'WPA' : 'nopass'};S:${wifiEsc(w.name)};${w.password ? `P:${wifiEsc(w.password)};` : ''};`, 'wifi');
}

function qrSvg(id, { standalone = false } = {}) {
  const k = CODES.get(id);
  const q = QRCode.create(k.data, { errorCorrectionLevel: 'M' });
  const n = q.modules.size, pad = 3, S = n + pad * 2;
  const eye = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const on = (r, c) => q.modules.get(r, c) && !eye(r, c);
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n;) {
      if (!on(r, c)) { c++; continue; }
      let e = c; while (e < n && on(r, e)) e++;
      d += `M${c + pad} ${r + pad}h${e - c}v1.02h-${e - c}z`;   /* 1.02: no hairline seams between rows in PDF viewers */
      c = e;
    }
  }
  const finder = (x, y) => `<rect x="${x + pad + .5}" y="${y + pad + .5}" width="6" height="6" rx="1.5" fill="none" stroke="${INK}"/><rect x="${x + pad + 2}" y="${y + pad + 2}" width="3" height="3" rx=".8" fill="${INK}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}"${standalone ? ' width="1200" height="1200"' : ''} role="img" aria-label="QR code: ${esc(k.label)}"><rect width="${S}" height="${S}" rx="1.2" fill="#FFFFFF"/><path fill="${INK}" d="${d}"/>${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
}
const shownUrl = route => (DOMAIN + route).replace(/\/$/, '');
/* a QR block: the code, a bold label, and the address for anyone who can't scan */
function qr(id, { label, size, url = false } = {}) {
  const k = CODES.get(id);
  if (!k) throw new Error(`no QR code "${id}"`);
  k.used.add(piece);
  return `<div class="qr"${size ? ` style="--qr:${size}"` : ''}>${qrSvg(id)}<b>${esc(label ?? k.label)}</b>${url && k.route ? `<small>${esc(shownUrl(k.route)).replace(/\//g, '/<wbr>')}</small>` : ''}</div>`;
}

/* Wi-Fi box: the network from config, or lines to write it in by hand */
function wifiBox(c, { join = true } = {}) {
  const w = c.wifiNetwork || {};
  const val = v => v ? `<dd>${esc(v)}</dd>` : '<dd class="blank"></dd>';
  return `<div class="wifi"><span class="wifi__icon">${wifiIcon}</span><div><h3>${esc(C.wifi.head)}</h3><p>${esc(C.wifi.short)}</p>
    <dl><dt>Network</dt>${val(w.name)}<dt>Password</dt>${val(w.password)}</dl></div>
    ${join && w.name ? qr(`wifi-${c.slug}`, { label: 'Scan to join', size: '.95in' }) : ''}</div>`;
}

/* ---- pages ---------------------------------------------------------------------- */
const pieces = [];
function shell(title, size, sheets) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} (print) | ${esc(B.short)}</title>
<link rel="icon" href="/assets/logo/favicon-32.png" sizes="32x32" type="image/png">
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/print/print.css">
<style>@page{ size: ${size === 'wide' ? '11in 8.5in' : '8.5in 11in'}; margin: 0 }</style>
</head>
<body class="print">
<main>
${sheets.join('\n')}
</main>
</body>
</html>
`;
}
const add = (dir, pdf, title, size, build) => {
  piece = title;
  pieces.push({ dir, pdf, title, html: shell(title, size, build()) });
};

/* ---- 1 · the tri-fold pamphlet -------------------------------------------------------
   Outside: [inside flap | back | cover]   Inside: [Yellowstone | seasons | wildlife]
   Print both sides, flip on the short edge, then roll-fold the cover over.   */
add('pamphlet', '1 Pamphlet/Guest Pamphlet - Tri-fold.pdf', 'Guest pamphlet', 'wide', () => {
  const near = [
    ['Elk Creek Station', 'Gas, snacks, propane, ATM'],
    ['Island Park Liquor and Sports', 'Liquor store, Wed to Sat'],
    ['Island Park Post Office', 'Closed Sundays'],
    ['Sam Patch Co. Grocer and Sundries', 'Closest grocery store, firewood, licenses'],
  ];
  const fee = parkFact('Entrance fee').value;
  const seasons = list(G.SEASONS, s => `<div class="p-season"><h3>${esc(s.label)}</h3><ul>${list(picks(s.id), p =>
    `<li><span>${esc(p.short || p.name)}</span>${p.drive != null ? `<b>${drive(p.drive)}</b>` : ''}</li>`)}</ul></div>`);
  return [`<div class="sheet sheet--wide pam" aria-label="Outside">
  <div class="panel">
    <span class="sign">Close to the cabins</span>
    <h2>Groceries, gas and help</h2>
    <ul class="rows">${list(near, ([n, what]) => `<li><span>${esc(n)}<small>${esc(what)}</small></span>${supply(n).drive != null ? `<b>${drive(supply(n).drive)}</b>` : ''}</li>`)}
      <li><span>Island Park Medical Clinic<small>By Pond’s Lodge. Weekdays 8 to 5, walk-ins</small></span><b>10${NB}min</b></li>
      <li><span>Nearest ER: Madison Memorial<small>Rexburg. Call 911 in an emergency</small></span><b>1${NB}hr${NB}15${NB}min</b></li>
    </ul>
    <p class="note">${esc(pharmacy())}</p>
    <div class="box"><h3>Your stay</h3><p>Check-in ${esc(policy('Check-in'))}. Checkout ${esc(policy('Checkout'))}.</p><p class="note" style="margin-top:.04in">${esc(C.wifi.short)} The network name and password are on the welcome sign in your cabin.</p></div>
    <div class="qrs">${qr('checkin', { label: 'Checking in' })}${qr('checkout', { label: 'Checking out' })}</div>
  </div>
  <div class="panel">
    <span class="sign">Book online</span>
    <h2>${esc(C.checkout.returnHead)}</h2>
    <p>${esc(C.checkout.returnLede)} ${esc(noFees())}</p>
    ${qr('book', { label: 'Book your next stay', size: '1.35in', url: true })}
    ${(() => { const r = C.reviews.items.find(x => x.text.length > 70 && x.text.length < 140); return r ? `<blockquote class="quote"><span class="stars" role="img" aria-label="5 out of 5 stars">★★★★★</span><p>${esc(r.text)}</p><footer>${esc(r.name)} · ${esc(r.when)}</footer></blockquote>` : ''; })()}
    <div class="box">
      ${email ? `<p><b>${esc(email)}</b></p>` : ''}
      <p class="note" style="margin-top:.04in">Office: ${esc(B.street)}, ${esc(B.city)}, ${esc(B.region)} ${esc(B.zip)}</p>
    </div>
    <p class="note" style="margin-top:auto">${esc(C.guide.checkedNote)}</p>
  </div>
  <div class="panel cover on-dusk">
    ${draft}
    ${photo('teal-cabins-drive', { pos: '50% 30%' })}
    <div class="in">
      <img class="disc" src="${LOGO}" width="${C.logo.w}" height="${C.logo.h}" alt="${esc(B.name)} logo">
      <span class="sign">${esc(B.city)}, ${esc(B.state)}</span>
      <h1>${esc(B.short)}</h1>
      <p>Your guide to ${esc(B.city)} and Yellowstone, with drive times from the cabins.</p>
    </div>
  </div>
</div>`, `<div class="sheet sheet--wide pam" aria-label="Inside">
  <div class="panel">
    <span class="sign">Yellowstone</span>
    <h2>In through the West Entrance</h2>
    <ul class="rows">
      <li><span>West Entrance<small>Cars mid-April to Oct 31. Mid-Dec to mid-March, snowcoach and snowmobile tours only</small></span><b>${drive(placeById('west-yellowstone').drive)}</b></li>
      <li><span>Entrance pass<small>${esc(fee.split('. ')[0])}. No reservation needed (2026)</small></span><b>${esc((fee.match(/\$\d+/) || [''])[0])}</b></li>
    </ul>
    <h3>Day plans</h3>
    <ul class="rows">${list(G.DAYS.slice(0, 4), d => `<li><span>${esc(d.title)}<small>${esc(d.stops[d.stops.length - 1])}</small></span><b>${esc(d.driveNote.replace(/^About /, '').replace(/ each way.*$/, '').replace(/ to .*$/, ''))}</b></li>`)}</ul>
    <p class="note">Times are one way, with no stops or traffic. Be at the gate before 7 am, or come in after noon. No gas at Madison or Norris: fill up in West Yellowstone.</p>
  </div>
  <div class="panel">
    <span class="sign">${esc(B.city)}</span>
    <h2>What to do, by season</h2>
    ${seasons}
  </div>
  <div class="panel">
    <span class="sign">Wildlife</span>
    <h2>How close is too close</h2>
    <ul class="bullets">${list(G.PARK_RULES, r => `<li>${esc(r)}</li>`)}</ul>
    <div class="qrs">${qr('guide', { label: 'Things to do by season' })}${qr('map', { label: 'Map with drive times' })}</div>
  </div>
</div>`];
});

/* ---- 2 · flyers ------------------------------------------------------------------- */
add('flyer-book', '2 Flyers/Book Your Stay Flyer.pdf', 'Book your stay flyer', 'letter', () => {
  const H = C.home;
  /* each cabin's first OwnerRez photo: the cabin from the ground (the hero is the drone) */
  const cabin = c => `<div class="fb__cabin">${c.gallery && c.gallery[0] ? orPhoto(c.gallery[0].id) : lead(c)}<h2>${esc(c.name)}</h2><span class="t">${esc(cabinFacts(c).join(' · '))}</span><p>${esc(c.summary)}</p></div>`;
  return [`<div class="sheet sheet--letter fb">
  ${draft}
  ${photo(H.heroPhoto, { pos: '30% 62%', big: true }).replace('<img ', '<img class="fb__photo" ')}
  <div class="fb__body">
    <img class="disc" src="${LOGO}" width="${C.logo.w}" height="${C.logo.h}" alt="${esc(B.name)} logo">
    <span class="sign">${esc(B.city)}, ${esc(B.state)}</span>
    <h1>${esc(H.h1)}</h1>
    <p class="lede">${esc(H.lede)}</p>
    <ul class="fb__facts">${list(H.facts, f => `<li>${f}</li>`)}</ul>
    <div class="fb__cabins">${list(C.cabins, cabin)}</div>
  </div>
  <div class="fb__cta on-dusk">
    <div>
      <span class="sign">Book online</span>
      <h2>${esc(H.bookCard.head)}</h2>
      <p>${esc(H.bookLede)}</p>
      <p class="contact">${esc(DOMAIN)}${email ? `<br>${esc(email)}` : ''}</p>
    </div>
    ${qr('book', { label: 'Scan to book' })}
  </div>
</div>`];
});

add('flyer-things-to-do', '2 Flyers/Things To Do by Season Flyer.pdf', 'Things to do flyer', 'letter', () => [`<div class="sheet sheet--letter ft">
  ${draft}
  <div class="ft__strip">${photo('grand-prismatic')}${photo('upper-mesa-falls')}${photo('reservoir-island')}${photo('morning-glory-pool')}</div>
  <div class="ft__head">
    <span class="sign">${esc(B.city)} and Yellowstone</span>
    <h1>Things to do, by season</h1>
    <p class="lede">${esc(C.guide.lede)} Scan a season for the full list on your phone.</p>
  </div>
  <div class="ft__seasons">${list(G.SEASONS, s => `<div class="ft__season">
    <h2>${esc(s.label)}</h2><p>${esc(s.note.split('. ')[0])}.</p>
    ${qr(`season-${s.id}`, { label: `${s.label} list` })}
    <ul class="rows">${list(picks(s.id), p => `<li><span>${esc(p.short || p.name)}</span>${p.drive != null ? `<b>${drive(p.drive)}</b>` : ''}</li>`)}</ul>
  </div>`)}</div>
  <div class="ft__foot">
    <div><h2>Every stop, one map</h2><p class="note">${esc(G.SIGHTS_NOTE)}</p><p class="note" style="margin-top:.04in">${esc(C.guide.checkedNote)}</p></div>
    ${qr('map', { label: 'Map' })}
    ${qr('guide', { label: 'Full guide' })}
  </div>
</div>`]);

/* ---- 3 · cabin signs: welcome (frame it by the door) and checkout (on the fridge) --- */
for (const c of C.cabins) {
  add(`sign-welcome-${c.slug}`, `3 Cabin Signs/${c.name} - Welcome Sign.pdf`, `${c.name} welcome sign`, 'letter', () => [`<div class="sheet sheet--letter ws">
  ${draft}
  <div class="ws__top">
    ${logoImg()}
    <span class="sign">${esc(c.address)}, ${esc(B.city)}</span>
    <h1>Welcome to ${esc(c.name)}</h1>
    <p class="lede">${esc(C.print.signLede)}</p>
  </div>
  ${wifiBox(c)}
  <div class="ws__qrs">
    ${qr(`checkin-${c.slug}`, { label: 'Check-in guide', url: true })}
    ${qr('guide', { label: 'Things to do', url: true })}
    ${qr(`checkout-${c.slug}`, { label: 'Checkout steps', url: true })}
  </div>
  <div class="ws__foot">
    <div class="ws__times"><div><span>Check-in</span><b>${esc(policy('Check-in').split(',')[0])}</b></div><div><span>Checkout</span><b>${esc(policy('Checkout'))}</b></div></div>
    ${email ? `<p>Questions? Email us<br><b>${esc(email)}</b></p>` : ''}
  </div>
</div>`]);

  add(`sign-checkout-${c.slug}`, `3 Cabin Signs/${c.name} - Checkout Sign.pdf`, `${c.name} checkout sign`, 'letter', () => [`<div class="sheet sheet--letter co">
  ${draft}
  <div class="co__head">
    <div><span class="sign">${esc(c.name)}</span><h1>Before you head out</h1><p class="lede">${esc(C.checkout.lede)}</p></div>
    ${logoImg()}
  </div>
  <ol class="steps">${list(c.checkout, st => `<li><div><b>${esc(st.title)}</b>${st.detail ? `<p>${esc(st.detail)}</p>` : ''}</div></li>`)}</ol>
  <div class="co__foot on-dusk">
    ${qr(`checkout-${c.slug}`, { label: 'This list on your phone' })}
    <div><h2>${esc(C.checkout.returnHead)}</h2><p>${esc(C.checkout.returnLede)}</p></div>
    ${qr('book', { label: 'Book your next stay' })}
  </div>
</div>`]);
}

/* ---- 4 · welcome binders -------------------------------------------------------------
   15 Letter pages per cabin. Each section page carries a QR code to the same
   page on the site, so the paper never has to be the last word.           */
for (const c of C.cabins) {
  add(`binder-${c.slug}`, `4 Welcome Binders/${c.name} - Welcome Binder.pdf`, `${c.name} welcome binder`, 'letter', () => {
    const inside = (C.home.inside || []).filter(([slug]) => slug === c.slug).map(([, id]) => id).slice(0, 2);
    const reviews = C.reviews.items.filter(r => r.cabin === c.slug && r.text.length > 90 && r.text.length < 330).slice(0, 2);
    const cover = c.slug === 'pine-shadows' ? photo('teal-cabin-golden', { pos: '50% 38%', big: true }) : photo('canopy-mauve-roof', { pos: '50% 50%', big: true });
    const sections = [
      { label: 'Checking in', title: 'Checking in', lede: C.checkin.lede, qr: `checkin-${c.slug}`, qrLabel: 'On your phone', body: () => `
        <ol class="steps">${list(c.checkin, st => `<li><div><b>${esc(st.title)}</b><p>${esc(st.detail)}</p></div></li>`)}</ol>
        ${wifiBox(c)}
        <div class="addr"><div><span>Your address</span><b>${esc(c.address)}, ${esc(B.city)}, ${esc(B.region)}</b></div><p class="note">For deliveries, ride shares<br>and 911</p></div>` },
      { label: 'Your cabin', title: `About ${c.name}`, lede: c.intro, qr: `cabin-${c.slug}`, qrLabel: 'Every photo', body: () => `
        <div class="photos2">${list(inside, id => orPhoto(id))}</div>
        <div><h2>Rooms and beds</h2><p style="margin-top:.06in">${esc(c.description[1])}</p><p class="note" style="margin-top:.06in">Sleeps ${c.sleeps}: ${esc(c.beds)}.</p></div>
        <div><h2 style="margin-bottom:.06in">What’s here</h2><ul class="amen">${list(c.amenities, a => `<li>${esc(a)}</li>`)}</ul></div>` },
      { label: 'Good to know', title: 'Good to know', lede: 'House rules and a few things about life in the forest.', qr: 'faq', qrLabel: 'Questions and answers', body: () => {
        const rows = [
          ['Check-in', policy('Check-in')], ['Checkout', policy('Checkout')],
          ['Smoking', policy('Smoking')], ['Pets', policy('Pets')],
          ['Garbage', garbage(c)],
          ['Bears and moose', practical('Bears and moose').value], ['Fire', practical('Fire').value],
          ['Altitude', practical('Altitude').value], ['Weather', practical('Weather').value],
        ].filter(([, v]) => v);
        const fire = galleryPhoto(c, /fire pit/i);
        const more = galleryPhoto(c, /snow|winter/i) || galleryPhoto(c, /^(?!.*(living|kitchen)).*deck/i, [fire && fire.id, c.lead]);
        return `<dl class="dl">${list(rows, ([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)}</dl>
        ${fire && more ? `<div class="photos2 photos2--short bottom">${orPhoto(fire.id)}${orPhoto(more.id)}</div>` : ''}`;
      } },
      { label: 'Yellowstone', title: 'Yellowstone', lede: C.guide.yellowstoneLede, qr: 'yellowstone', qrLabel: 'Latest road and park news', body: () => {
        const facts = ['Entrance fee', 'From outside the US', 'Reservations', 'West Entrance', 'Gas and food', 'Cell service', 'Fishing'].map(parkFact).filter(Boolean);
        return `<dl class="dl">${list(facts, f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)}</dl>
        <ul class="bullets">${list(G.PARK_RULES.slice(0, 4), r => `<li>${esc(r)}</li>`)}</ul>
        <div class="photos2 photos2--short bottom">${photo('grand-prismatic')}${photo('morning-glory-pool', { pos: '50% 62%' })}</div>`;
      } },
      { label: 'Yellowstone', title: 'Yellowstone day plans', lede: 'Five days in the park from our door. Times are one way with no stops; summer days run slower, so add at least a third.', qr: 'yellowstone', qrLabel: 'Day plans', body: () => `
        <div>${list(G.DAYS, d => `<div class="dayplan"><h3>${esc(d.title)}</h3><span class="t">${esc(d.driveNote)}</span><p>${esc(d.summary)}</p><ol>${list(d.stops, s => `<li>${esc(s)}</li>`)}</ol>${d.note ? `<p class="tip">${esc(d.note)}</p>` : ''}</div>`)}</div>` },
      { label: 'Things to do', title: 'Things to do, by season', lede: C.guide.lede, qr: 'guide', qrLabel: 'The full guide', body: () => `
        <div class="seasons4">${list(G.SEASONS, s => `<div class="season"><h2>${esc(s.label)}</h2><p>${esc(s.note)}</p>${qr(`season-${s.id}`, { label: s.label })}<ul class="rows">${list(picks(s.id), p => `<li><span>${esc(p.short || p.name)}</span>${p.drive != null ? `<b>${drive(p.drive)}</b>` : ''}</li>`)}</ul></div>`)}</div>` },
      { label: 'Wildlife', title: 'Wildlife: where to look', lede: C.guide.wildlifeLede, qr: 'wildlife', qrLabel: 'Wildlife guide', body: () => `
        <ul class="rows wild">${list(G.WILDLIFE, w => `<li><b>${esc(w.name)}</b><span>${esc(w.where)}<small>${esc(w.when)}</small></span></li>`)}</ul>
        <ul class="bullets">${list(G.PARK_RULES.slice(4), r => `<li>${esc(r)}</li>`)}</ul>` },
      { label: 'Eat', title: 'Restaurants', lede: C.guide.foodLede, qr: 'food', qrLabel: 'Restaurants', body: () => {
        const half = Math.ceil(G.FOOD.length / 2);
        const col = arr => `<ul class="rows">${list(arr, f => `<li><span>${esc(f.name)}<small>${esc(f.kind)}. ${esc(f.town)}.${f.note ? ` ${esc(f.note)}` : ''}</small></span>${f.drive != null ? `<b>${drive(f.drive)}</b>` : ''}</li>`)}</ul>`;
        return `<div class="cols">${col(G.FOOD.slice(0, half))}${col(G.FOOD.slice(half))}</div>`;
      } },
      { label: 'Supplies', title: 'Groceries, gas and supplies', lede: C.guide.suppliesLede, qr: 'supplies', qrLabel: 'Groceries and gas', body: () => {
        const half = Math.ceil(G.SUPPLIES.length / 2);
        const col = arr => `<ul class="rows">${list(arr, s => `<li><span>${esc(s.name)}<small>${esc(s.kind)}. ${esc(s.town)}.${s.note ? ` ${esc(s.note)}` : ''}</small></span>${s.drive != null ? `<b>${drive(s.drive)}</b>` : ''}</li>`)}</ul>`;
        return `<div class="cols">${col(G.SUPPLIES.slice(0, half))}${col(G.SUPPLIES.slice(half))}</div>`;
      } },
      { label: 'Shows and events', title: 'Shows and events', lede: C.guide.showsLede, qr: 'shows', qrLabel: 'Shows and events', body: () => {
        const shows = G.PLACES.filter(p => p.chapter === 'shows');
        return `<ul class="rows">${list(shows, p => `<li><span>${esc(p.name)}<small>${esc(p.kind || '')}${p.area ? ` · ${esc(p.area)}` : ''}</small></span>${p.drive != null ? `<b>${drive(p.drive)}</b>` : ''}</li>`)}</ul>
        <div><h2>Through the year</h2><p class="note" style="margin:.03in 0 .08in">${esc(C.guide.eventsLede)}</p>
        ${(() => { const half = Math.ceil(G.EVENTS.length / 2); const col = arr => `<ul class="rows ev">${list(arr, e => `<li><span>${esc(e.name)}<small><em>${esc(e.when)}</em> · ${esc(e.town)}</small></span></li>`)}</ul>`; return `<div class="cols">${col(G.EVENTS.slice(0, half))}${col(G.EVENTS.slice(half))}</div>`; })()}</div>`;
      } },
      { label: 'Emergencies', title: 'Emergencies and practical notes', lede: '', qr: 'practical', qrLabel: 'Practical notes', body: () => {
        const rows = ['Nearest ER', 'Clinic', 'Pharmacy', 'Useful numbers', 'Roads', 'Fishing licenses', 'Boats and paddleboards'].map(practical).filter(Boolean);
        return `<div class="sos"><strong>911</strong><div><p><b>${esc(practical('Emergencies').value)}</b></p><p style="margin-top:.04in">Tell the dispatcher you are at <b>${esc(c.address)}, ${esc(B.city)}, ${esc(B.region)}</b>.</p></div></div>
        <dl class="dl">${list(rows, f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.label === 'Pharmacy' ? pharmacy() : f.value)}</dd></div>`)}</dl>`;
      } },
      { label: 'Checking out', title: 'Checking out', lede: C.checkout.lede, qr: `checkout-${c.slug}`, qrLabel: 'On your phone', body: () => `
        <ol class="steps">${list(c.checkout, st => `<li><div><b>${esc(st.title)}</b>${st.detail ? `<p>${esc(st.detail)}</p>` : ''}</div></li>`)}</ol>` },
    ];
    const first = 3;                               /* cover is 1, the welcome letter 2 */
    const last = first + sections.length;           /* the back page */
    const head = label => `<div class="bp__head"><span class="sign">${esc(label)}</span><span class="cab">${esc(c.name)}</span></div>`;
    const foot = n => `<div class="bp__foot"><span>${esc(B.name)} · ${esc(DOMAIN)}</span><b>${n}</b></div>`;
    const toc = [...sections.map((s, i) => [s.title, first + i]), [C.print.backHead, last]];

    return [
      `<div class="sheet sheet--letter bc on-dusk">
  ${draft}
  ${cover}
  <div class="bc__in">
    <img class="disc" src="${LOGO}" width="${C.logo.w}" height="${C.logo.h}" alt="${esc(B.name)} logo">
    <span class="sign">Welcome binder</span>
    <h1>Welcome to ${esc(c.name)}</h1>
    <p>${esc(c.address)}, ${esc(B.city)}, ${esc(B.state)}</p>
    <p class="fine">${esc(B.name)} · ${esc(DOMAIN)}</p>
  </div>
</div>`,
      `<div class="sheet sheet--letter bp">
  ${head('Welcome')}
  <div class="bp__body"><div class="cols cols--wide">
    <div class="letter"><h1 style="margin-bottom:.16in">Welcome</h1>${list(C.print.welcome, p => `<p>${esc(fill(p, c))}</p>`)}
      <p>${esc(C.print.signoff)}</p><p class="sig">Robyn and Eric</p>${email ? `<p class="note">${esc(email)}</p>` : ''}</div>
    <div class="toc"><h2>In this binder</h2><ul>${list(toc, ([t, n]) => `<li><span>${esc(t)}</span><b>${n}</b></li>`)}</ul></div>
  </div>
  ${photo('canopy-three-roofs', { cls: 'wide-photo bottom', pos: '50% 55%', big: true })}</div>
  ${foot(2)}
</div>`,
      ...sections.map((s, i) => `<div class="sheet sheet--letter bp">
  ${head(s.label)}
  <div class="bp__body">
    <div class="bp__title"><div><h1>${esc(s.title)}</h1>${s.lede ? `<p class="lede">${esc(s.lede)}</p>` : ''}</div>${qr(s.qr, { label: s.qrLabel })}</div>
    ${s.body()}
  </div>
  ${foot(first + i)}
</div>`),
      `<div class="sheet sheet--letter back on-dusk">
  <span class="sign">Come back soon</span>
  <h1>${esc(C.print.backHead)}</h1>
  <p class="lede">${esc(C.checkout.returnLede)}</p>
  <div class="back__book">${qr('book', { label: 'Book your next stay' })}<div><h2>Book on our website</h2><p>${esc(C.home.bookLede)}</p><p class="note" style="margin-top:.08in">${esc(DOMAIN)}/book</p></div></div>
  ${reviews.length ? `<div class="quotes">${list(reviews, r => `<blockquote><p>${esc(r.text)}</p><footer>${esc(r.name)} · ${esc(r.when)}</footer></blockquote>`)}</div>` : ''}
  <div class="back__foot"><img class="disc" src="${LOGO}" width="${C.logo.w}" height="${C.logo.h}" alt="${esc(B.name)} logo"><p>${email ? `${esc(email)}<br>` : ''}${esc(DOMAIN)}<br>Office: ${esc(B.street)}, ${esc(B.city)}, ${esc(B.region)} ${esc(B.zip)}</p></div>
</div>`,
    ];
  });
}

/* ---- 5 · the QR sheet: every code, what it opens, where it is printed --------------
   Built last, so "printed on" is complete.                                  */
piece = 'QR code sheet';
const codeList = [...CODES.values()];
const qrSheetHtml = () => {
  const perPage = 12;
  const pages = [];
  for (let i = 0; i < codeList.length; i += perPage) pages.push(codeList.slice(i, i + perPage));
  return pages.map((items, pi) => `<div class="sheet sheet--letter qs">
  ${pi === 0 ? `<div><span class="sign">QR codes</span><h1 style="margin-top:.1in">Every QR code we print</h1><p class="note" style="margin-top:.06in">Each opens the page shown under it on ${esc(TEST ? ORIGIN.replace(/^https?:\/\//, '') : B.domain)}. SVG and PNG copies are in this folder. They only work once the domain points at the new site.</p></div>` : ''}
  <div class="qs__grid">${list(items, k => `<div class="qs__item">${qrSvg(k.id)}<b>${esc(k.label)}</b><code>${esc(k.kind === 'url' ? k.route : 'Joins the Wi-Fi network')}</code><i>${esc([...k.used].join(', ') || 'Not printed yet')}</i></div>`)}</div>
</div>`);
};

/* ---- 6 · OwnerRez automated message drafts (the other half of automating
   check-in and checkout: OwnerRez sends the links, the QR codes cover the
   cabin). Plain text, to paste into Messaging > Templates. ------------------- */
function messages() {
  const link = r => ORIGIN + r;
  const out = [`OwnerRez automated guest messages: drafts
Wilderness Escape Rentals

How to use: in OwnerRez, create each one under Messaging > Templates, then
add a Trigger so it sends on its own (timing is under each heading). Replace
every [bracket] with the matching OwnerRez field, and make one copy per cabin
(each has its own links below). The pages they link to are live once the
domain points at the new site.
`];
  for (const c of C.cabins) {
    out.push(`
==========================================================================
${c.name.toUpperCase()}
==========================================================================

1. CHECK-IN DETAILS: send 2 days before arrival
--------------------------------------------------------------------------
Subject: Your stay at ${c.name}: check-in details

Hi [guest first name],

We can't wait to have you at ${c.name}! Check-in is from ${policy('Check-in').split(',')[0]} on [arrival date], and the keypad lets you in, so arrive whenever suits you.

Address: ${c.address}, ${B.city}, ${B.region}
Your door code: [door code]

Directions, parking, Wi-Fi and everything else for arrival are on one page:
${link(`/checkin/${c.slug}/`)}

Planning your days? Things to do in ${B.city} and Yellowstone by season, with drive times from the cabin:
${link('/guide/')}

Questions? Just reply to this message.
Robyn and Eric

2. CHECKOUT REMINDER: send the evening before departure, about 6:00 pm
--------------------------------------------------------------------------
Subject: Checkout tomorrow at ${c.name}

Hi [guest first name],

We hope you've had a wonderful stay! Checkout is ${policy('Checkout')} tomorrow. The quick list (also on the fridge):

${c.checkout.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}

The full list with details: ${link(`/checkout/${c.slug}/`)}

Safe travels,
Robyn and Eric

3. THANK YOU: send the day after departure
--------------------------------------------------------------------------
Subject: Thank you for staying at ${c.name}

Hi [guest first name],

Thank you for staying with us! If you have a minute, a 5-star review helps other families find our cabins.

${C.checkout.returnLede} ${noFees()}
${link('/book/')}

Robyn and Eric
`);
  }
  return out.join('');
}

/* ---- write, guard, render ------------------------------------------------------------ */
const qrHtml = shell('QR code sheet', 'letter', qrSheetHtml());
pieces.push({ dir: 'qr-sheet', pdf: '5 QR Codes/QR Code Sheet.pdf', title: 'QR code sheet', html: qrHtml });
const msgText = messages();

let failed = false;
for (const p of pieces) {
  for (const ch of ['—']) {
    const i = p.html.indexOf(ch);
    if (i > -1) { failed = true; console.error(`EM DASH in ${p.dir}: ...${p.html.slice(Math.max(0, i - 50), i + 30).replace(/\s+/g, ' ')}...`); }
  }
  fs.mkdirSync(path.join(ROOT, 'print', p.dir), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'print', p.dir, 'index.html'), p.html);
}
if (msgText.includes('—')) { failed = true; console.error('EM DASH in the guest messages'); }
if (failed) process.exit(1);
console.log(`wrote ${pieces.length} print pages to print/ · ${CODES.size} QR codes${SAMPLE ? ' (SAMPLE = true, draft flag on)' : ''}${TEST ? ` · TEST codes open ${ORIGIN}` : ''}`);
if (NO_PDF) process.exit(0);

/* serve this folder on a spare port, the way server.js does */
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!path.resolve(f).startsWith(ROOT)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  fs.readFile(f, (e, buf) => e ? res.writeHead(404).end() : res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }).end(buf));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const { chromium } = createRequire('/Users/dylanevans/Projects/EZHD/ezhd-lab/package.json')('playwright-core');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
for (const p of pieces) {
  await page.goto(`${base}/print/${p.dir}/`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  /* nothing may spill off a sheet, a panel or a binder page: it would be clipped in print */
  const bad = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.sheet, .pam .panel, .bp__body').forEach((el, i) => {
      if (el.scrollHeight > el.clientHeight + 1) out.push(`${el.className.split(' ').pop()} #${i + 1} overflows by ${((el.scrollHeight - el.clientHeight) / 96).toFixed(2)}in`);
    });
    document.querySelectorAll('img').forEach(im => { if (!im.naturalWidth) out.push(`image did not load: ${im.getAttribute('src')}`); });
    return out;
  });
  bad.forEach(b => warnings.push(`${p.title}: ${b}`));
  const file = path.join(OUT, p.pdf);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.pdf({ path: file, preferCSSPageSize: true, printBackground: true });
  console.log('wrote', path.relative(path.join(ROOT, '..'), file));
}

/* every QR code as SVG (any size, for Canva or a sign maker) and 1200 px PNG */
for (const k of codeList) {
  const svg = qrSvg(k.id, { standalone: true });
  const name = k.file.replace(/[\/:]/g, '-');
  fs.mkdirSync(path.join(OUT, '5 QR Codes', 'SVG'), { recursive: true });
  fs.mkdirSync(path.join(OUT, '5 QR Codes', 'PNG'), { recursive: true });
  fs.writeFileSync(path.join(OUT, '5 QR Codes', 'SVG', `${name}.svg`), svg);
  await page.setViewportSize({ width: 1200, height: 1200 });
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.locator('svg').screenshot({ path: path.join(OUT, '5 QR Codes', 'PNG', `${name}.png`) });
}
console.log(`wrote ${codeList.length} QR codes (SVG + PNG)`);

fs.mkdirSync(path.join(OUT, '6 Guest Messages'), { recursive: true });
fs.writeFileSync(path.join(OUT, '6 Guest Messages', 'OwnerRez Automated Messages.txt'), msgText);
console.log('wrote the OwnerRez message drafts');

await browser.close();
server.close();
for (const w of warnings) console.warn('warn:', w);
