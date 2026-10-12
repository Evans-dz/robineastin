# DESIGN.md: Wilderness Escape Rentals

> The contract. Every session reads this before touching markup or CSS.
> Client: Robyn Eastin. Two cabins next door to each other in the lodgepole
> pine, Pine Shadows (3810 Mortensen Ln) and Wilderness Escape Retreat (3808),
> with a shared game garage, Island Park, Idaho, 30 minutes from Yellowstone's
> West Entrance (Robyn's figure for the 29.5 road miles).
> Booking engine stays OwnerRez (calendar sync with Airbnb/VRBO, payments,
> taxes, agreements). This site sells the stay and the place; OwnerRez takes
> the money. Guests book on this site (Robyn, 7 Oct 2026: "would rather have
> them book on the website"), so every booking button lands on `/book/`.

---

## 1. Motion language

**Name:** Canopy descent.

**Where it comes from:** the property only makes sense from above. From the
road it is trees. From 120 feet up it is three metal roofs, Pine Shadows and
its game garage in aqua and Wilderness Escape Retreat in mauve, in a clearing
cut out of solid lodgepole pine, with the reservoir
nearby. Every photo that sells it came off a drone (the shoot in
`../photos/`, 4 to 7 Sept 2026). So the page behaves like the drone coming in to land: things arrive
from above and settle down onto the ground. Nothing on this site rises.

**How it shows up (three places, nowhere else):**
1. **Home hero.** The top-down canopy shot (`canopy-three-roofs-low`, DJI_0099,
   chosen for its colour) is the hero layer. Desktop anchors its bottom edge so
   the roofs sit clear above the copy; phones stack headline, clear roofs,
   then buttons in the first screen. As the visitor scrolls the first screen, the layer scales from 1 to
   1.22 about the aqua roofs: the drone sinking toward the cabins. Scrubbed on
   `view()`; image only, never the copy.
2. **Landing reveals, text.** Section heads and the cabin/guide cards land
   *downward* into place: `translate: 0 -0.9rem` to `0`, one-shot, with the
   gimbal-settle curve below. Only `h2` section heads, `.cabin-card` and
   `.guide-card` carry `.reveal`. Body paragraphs never animate.
3. **The map.** On `/guide/` the pins drop onto the Yellowstone map, staggered,
   the first time the map enters view (same one-shot tokens). The "Zoom to the
   cabins" control scales the map group toward the cabins pin: the same descent,
   driven by a button instead of scroll.

**What it must never do:** rise, bounce, overshoot or orbit. A drone that
bounces on landing has crashed. No parallax on text, no motion on every
paragraph, no rotating aerial, no cursor effects, no count-up numbers.

**Easing token:** `--reveal-ease: cubic-bezier(.45, 0, .1, 1)`. A gimbal
settle: it eases off the throttle, travels steadily, then takes a long, soft
touchdown with zero overshoot. Heavier and slower than any other EZHD site on
purpose (ALC sweeps, Armour seals, Sew True stitches, Iron strikes, EZHD
plots; this one lands).

```css
--reveal-rise:    -0.9rem;   /* negative: from ABOVE. The inversion is the language. */
--reveal-dur:     .95s;
--reveal-ease:    cubic-bezier(.45, 0, .1, 1);
--reveal-stagger: 110ms;
```

**Mechanism:** motion.css §7 one-shot reveal (text and cards), §4 hero layer on
a `view()` timeline with its keyframe changed from translate to `scale`
(documented variation: descent is a zoom, not a slide), §8 cross-document view
transitions between pages, §2 progress bar only on `/guide/` (long page).
Deliberately not used: §5 pin, §6 horizontal scroll, §3 scrub reveal. No GSAP.

## 2. Palette & roles

Revised 7 Oct 2026 at Robyn's request: **her logo and the light blue scheme of
her old OwnerRez site** (primary `#1B4070` navy, `#64799C` light blue strip,
`#FCFCF7` warm white). The drone-photo palette it replaced is in git history.
Last light stays as the drive-time marker: it is the sun in her logo.

| Role | Token | Value | Used for | Contrast |
|---|---|---|---|---|
| surface | `--bg` | `#FAFAF6` warm white | page ground | |
| raised | `--bg-2` | `#E9EEF5` pale sky | cards, wells, alternate sections | |
| pressed | `--bg-3` | `#DCE4EF` | hover ground | |
| ink | `--fg` | `#16233A` navy ink | body copy | 15.0:1 on bg |
| muted | `--fg-2` | `#4A5870` | secondary copy | 6.9:1 on bg, 6.2:1 on bg-2 |
| accent | `--accent` | `#1B4070` Robyn's navy | **one job: the booking path** (Book now, Book this cabin) | white on it 10.4:1 |
| light blue | `--sky` | `#64799C` her exact light blue | rules, card top borders, large fills only | white on it 4.4:1, so no small text |
| light blue ink | `--sky-ink` | `#5A6F92` | the top bar and the sign labels (small white text) | white 5.1:1 |
| marker | `--marker` | `#9A5412` last light | **one job: the cabins as a place**. The cabins' map pin and every "from the cabins" drive time | 5.5:1 on bg |
| star | `--star` | `#A86F0F` | review stars only | 4.1:1 on bg, 3.6:1 on bg-2 |
| line | `--line` | `#C9D3E0` | decorative hairlines only | |
| UI edge | `--line-ui` | `#7A88A0` | input and control borders | 3.4:1 on bg |
| dusk ground | `--dusk` | `#11243F` deep navy | hero shade, footer, map, closing call to book | |
| dusk ink | `--dusk-fg` | `#EEF2F7` | text on dusk | 13.9:1 |
| dusk muted | `--dusk-fg-2` | `#AEBBD0` | secondary on dusk | 8.0:1 |
| accent on dusk | `--roof` | `#BCD0EA` light sky | the accent's job on dark grounds (navy text on it) | 9.9:1 |
| marker on dusk | `--marker-dusk` | `#E9A64A` | the marker's job on dark grounds | 7.4:1 on dusk |

The header is white (her logo is a JPEG drawn for a light ground; the white was
made transparent, but its dark green lettering needs light behind it). On navy
the logo always sits on a warm-white disc (footer, pamphlet cover). Map pins
take their category colour from `CATEGORIES` in `js/places.js`, the same colour
as their legend chip. The mauve roof (`#BFA9BB`) is still **not** a UI colour.

## 3. Type

- **Display: Besley** (Clarendon revival, OFL). The Caribou-Targhee National
  Forest signs all over Island Park are routed Clarendon letters on brown
  board; this is that voice, and it is close kin to the western slab lettering
  in Robyn's logo. Weights 700 for h1/h2, 600 for h3. Tracking
  -0.01em at display sizes. Stops scaling at 3.9rem.
- **Body: Public Sans** (the US government's open typeface, USWDS). Public
  lands, public-information clarity. 400 body, 600 labels. 1.0625rem base,
  measure 66ch, line-height 1.6. Tabular numerals (`font-variant-numeric:
  tabular-nums`) on every drive time, price and count.
- **Scale:** 1.25 ratio: 0.85 / 1.0625 / 1.33 / 1.66 / 2.07 / 2.6 / 3.25 rem
  (steps -1 to 5), fluid between 390 and 1440 px.
- **Loading:** self-hosted variable woff2 (`assets/fonts/`, latin subset),
  `font-display: swap`, display face preloaded. No CDN.

## 4. Components: what is different here

| Element | The decision | The reason |
|---|---|---|
| Drive-time tag | Every guide item carries "38 min from the cabins" in `--marker`, tabular | The guide's real question is always "how far from where we sleep?" Answered on every card, from one data file |
| Season switch | Four square segments: Summer, Fall, Winter, Spring. Filters the guide in place, remembers the choice | Island Park is four different places. A winter guest does not need huckleberry picking |
| Forest-sign label | Small section eyebrow set in Besley caps on `--fg` board with `--bg` letters, 2 px radius | Borrowed from the USFS routed signs; used for guide chapter labels only |
| Cabin card | Photo, name, sleeps · bedrooms · baths · sq ft in tabular figures, "Book now" and "See the cabin" | Two cabins, four facts that decide a booking. Amenities live on the cabin page |
| Logo | Robyn's own badge (`assets/logo/`), pulled from her old site: header (64 px, 52 px on phones), footer and pamphlet cover on a warm-white disc; the favicon is its mountain scene | Her brand, her request. Print needs her original file (ours is 500 px) |
| Book now | One page, `/book/`: both cabins side by side, each with its own OwnerRez booking form, then both calendars. The header button, the hero card and every cabin card land there. On desktop the hero carries a booking card (both cabins with photo and sleeps, then Book now) | Robyn wants guests booking on the site, and an enticing Book now on the hero and in the header |
| Booking slot | Robyn's real OwnerRez widgets (booking, calendars). OwnerRez only serves them to approved domains, so main.js loads widget.js on any real domain and shows a plain note on localhost. Fallback is "Email us". The box holding a booking form (`.book-slot--form`) sits on `--bg-3` with a navy top rule | No empty boxes and no fake calendar on previews. The form's iframe is transparent and OwnerRez draws its fields `#f9f9f9`, which vanish on `--bg` (Dylan, 12 Oct 2026) |
| Reviews | Static, from `CONFIG.reviews`: real guests' words from her OwnerRez reviews (all 5.0 stars), name as OwnerRez shows it, cabin, month. Five stars on each card, **no overall grade or platform average anywhere** (Robyn, 7 Oct 2026). `/reviews/` has all of them with a cabin filter; home shows three, each cabin page its own | Her request; static reviews also load on localhost and get indexed |
| Photos | Every property photo from her OwnerRez pages (`gallery` per cabin), lead plus four up top, the rest below with "See more". Each opens in a `<dialog>` viewer (previous, next, arrow keys, swipe, Esc). No motion in the viewer | "Needs more photos of properties" |
| The map | Hand-built inline SVG: projected from lat/lng in `js/places.js`, no tile server, no Leaflet. Category filter, tap a pin for its card, "Zoom to the cabins" | Zero-dep, works offline in the cabin with bad signal, prints in the pamphlet |
| Buttons | 3 px radius, never pills. Primary = `--accent` ground, white text | Polish standard |

## 5. Layout

- Container 76rem, gutter `clamp(1rem, 4vw, 2.5rem)`.
- Breakpoints that exist: 40rem (cards go 2-up), 64rem (3-up, guide gets its
  sticky filter rail). Nothing else.
- Home is a single column story: hero (with the booking card on desktop), the
  two cabins plus a look inside, where you are (drive times), groceries,
  restaurants and theatre close by, guide by season, three reviews, questions,
  and a closing call to book.
- Top level pages: home, the two cabins, `/book/`, `/reviews/`, `/faq/`,
  `/guide/`, `/map/`. Nav: The cabins, Things to do, Map, Reviews, FAQ, and the
  Book now button.
- `/guide/` is a long reference page: sticky season switch + chapter nav on
  desktop, a top bar of the same on mobile.

## 6. Depth

No shadows. Hairlines and ground changes only (`--bg` to `--bg-2`, light
grounds to `--dusk`). A photo is the only thing that ever sits "above" the page.

## 7. Do / Don't

**Do**
- Say "book online" or "book on our website". Never "book directly with Robyn,
  the owner" (Robyn, 7 Oct 2026).
- Headings and buttons in sentence case, and first-person plural where the
  host is speaking ("our cabins", "we love reading about your stay"). This is
  Robyn's own site, not a platform listing; it overrides the guidelines'
  Title Case and second-person-only rules on purpose.
- Put a drive time on everything in the guide.
- Use our own drone and ground photos; credit nothing we did not shoot.
- Write like a host who lives there: short, specific, useful.
- Modern JS (arrow functions, const/let) in `js/main.js`; no ES5 pin.

**Don't**
- Rise, bounce, parallax text or animate paragraphs (see §1).
- Invent a review, a rating, a price, a distance or an event date.
- Hard-code any fact in markup. It lives in `js/config.js` or `js/places.js`.
- Use the mauve roof colour, purple anything, or em dashes.
- Show a phone number anywhere: page, schema, llms.txt, pamphlet. Robyn asked
  for it off the site (7 Oct 2026). This deliberately overrides the polish
  rule "tap-to-call on the first screen"; email is the contact channel.
- Show an overall rating or a platform average (4.89, 10/10). Five-star
  reviews only, each with its own stars.

## 8. Responsive

- Mobile is most of the traffic (people plan trips on phones and use the guide
  in the car). Mobile: one column, the sticky header keeps the logo, Book now
  and Menu in reach,
  the season switch scrolls horizontally, the map is full-bleed with a list
  view under it.
- Desktop adds the 3-up cabin row, the guide's sticky side rail and a larger map.
- Tap targets 44 px minimum.

## 9. Data source of truth

**Files:** `js/config.js` (business, contact, cabins, policies, reviews,
booking widget codes) and `js/places.js` (every guide item and map point:
name, category, seasons, drive time, blurb, coordinates, source).

Every number, price, phone, hour, address and drive time on the site reads from
these files. `SAMPLE = true` until every `TODO(client)` is resolved.

## 10. Launch checklist

- [ ] Real data swapped in, `SAMPLE = false`
- [ ] Robyn's original logo file (vector or large PNG) for print; ours is her 500 px web JPEG
- [ ] Her OwnerRez photos self-hosted (they load from uc.orez.io for now)
- [ ] OwnerRez widget codes in `CONFIG.booking` (honestly unwired until then)
- [ ] Reviews: only real ones, with source and date, carried over from the old site / OwnerRez
- [ ] `noindex` removed, canonical + `og:image` + favicon + LodgingBusiness JSON-LD added
- [ ] Professional polish (`$LAB/reference/professional-polish.md`): no em dashes anywhere,
      no pill buttons, hero says what/who/where, tap-to-call on the first screen
- [ ] `privacy/` and `terms/` filled in (every `[your …]` replaced, real processors named),
      `404.html` checked, `llms.txt` written, `sitemap.xml` + robots `Sitemap:` line on the real domain
- [ ] 301 redirects from every old wildernessescaperentals.com URL to its new page
- [ ] Audit clean against the **deployed** URL, including the site-level polish checks
- [ ] `node verify/audit.mjs --url http://localhost:4214` clean
- [ ] Skill pass: `/web-design-guidelines index.html css/main.css`
