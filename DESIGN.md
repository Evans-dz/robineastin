# DESIGN.md — <Client Name>

> Copy this into a client repo root as `DESIGN.md` and fill it in **before**
> writing markup. It is the contract: every later session reads this instead of
> re-deriving taste from the existing CSS and drifting.
>
> Schema borrowed from the awesome-design.md convention. Sections 1 and 4 are
> the ones that make a build ours rather than a template — do not leave them
> generic. If this file could describe two different clients, it is not done.

---

## 1. Motion language

**Name:** <two or three words — "roll-up doors", "screen-print stamps",
"blueprint measurement sweep">

**Where it comes from:** <the physical object or trade the client actually
works with. Not a mood board.>

**How it shows up:** <the two or three concrete places on the page it appears,
and nowhere else. A motion language used everywhere is a texture, not a
language.>

**What it must never do:** <the tempting overreach to refuse>

**Easing token:** `--reveal-ease: <the curve>` — the curve IS the language.
`steps(3,end)` stamps, `cubic-bezier(.16,1,.3,1)` rolls, `cubic-bezier(.34,1.56,.64,1)`
springs. Set the four tokens at the top of `templates/motion.css` and change
nothing else; a new effect per client is drift, not a language.

**Mechanism:** <which of the six motion.css effects this build uses — and the
ones it deliberately does not. If this needs GSAP, say which feature and why
native CSS cannot do it.>

> One named motion language per build. It is the reason the portfolio does not
> look like eight versions of the same site.

## 2. Palette & roles

| Role | Token | Value | Used for |
|---|---|---|---|
| surface | `--bg` | | page ground |
| raised | `--bg-2` | | cards, wells |
| ink | `--fg` | | body copy |
| muted | `--fg-2` | | secondary copy, never below 4.5:1 |
| accent | `--accent` | | one job only — name it: |
| line | `--line` | | hairlines, dividers |

Contrast floor: 4.5:1 body, 3:1 large text and UI edges. Check both themes if
the site has two.

## 3. Type

- **Display:** <family, weight, tracking, the size it stops scaling>
- **Body:** <family, size, measure in ch, line-height>
- **Scale:** <the ratio, and the actual steps — not "modular scale">
- **Loading:** self-hosted woff2, `font-display: swap`, preloaded. No CDN.

## 4. Components — what is different here

Only document what departs from a plain HTML default. A `<button>` that looks
like a button needs no entry.

| Element | The decision | The reason |
|---|---|---|
| | | |

## 5. Layout

- Container max-width, gutters, the breakpoints that actually exist
- The grid, if there is one
- What reflows and what simply stacks

## 6. Depth

Shadow ramp or the deliberate absence of one. Borders vs. elevation — pick one
and hold it.

## 7. Do / Don't

**Do**
-

**Don't**
-

## 8. Responsive

- Mobile is the real traffic. Describe the mobile design, then what desktop adds.
- Tap targets ≥44px. `verify/audit.mjs` enforces ≥24px and warns under 44.

## 9. Data source of truth

**File:** `js/<name>.js`

Every number, price, phone, hour and address on the page reads from this file.
Nothing is hard-coded in markup. Sample data is flagged in the UI until launch.

## 10. Launch checklist

- [ ] Real data swapped in, `SAMPLE = false`
- [ ] Forms wired (honestly unwired until then)
- [ ] `noindex` removed, canonical + `og:image` + favicon + LocalBusiness JSON-LD added
- [ ] Professional polish (`$LAB/reference/professional-polish.md`): no em dashes anywhere,
      no pill buttons, hero says what/who/where, tap-to-call on the first screen
- [ ] `privacy/` and `terms/` filled in (every `[your …]` replaced, real processors named),
      `404.html` checked, `llms.txt` written, `sitemap.xml` + robots `Sitemap:` line on the real domain
- [ ] Audit clean against the **deployed** URL, including the site-level polish checks
- [ ] `node verify/audit.mjs --url http://localhost:<port>` clean
- [ ] Skill pass: `/web-design-guidelines index.html css/main.css`
