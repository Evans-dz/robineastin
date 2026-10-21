# Wilderness Escape Rentals · wildernessescaperentals.com rebuild

EZHD client build for Robyn Eastin: two family cabins in Island Park, Idaho
(Pine Shadows and Wilderness Escape Retreat), plus a seasonal Island Park and
Yellowstone guide with an interactive map. Zero-build static site; OwnerRez
stays the booking engine.

## Run it locally

```bash
node server.js            # http://localhost:4214
```

OwnerRez refuses its widgets on localhost, so booking, calendar and review
boxes show a note there. They load on any real domain (Vercel previews too).

## Change something

Every fact lives in three data files. Edit, then regenerate the pages:

| File | Holds |
|---|---|
| `js/config.js` | business, contact, cabins, policies, OwnerRez widget IDs, photos, copy |
| `js/places.js` | the guide: places, drive times, day plans, wildlife, food, supplies, events |
| `js/map-data.js` | map geometry (park outline, lakes, roads) |

```bash
node tools/build.mjs      # writes every page; fails on an em dash
node tools/print.mjs      # every printed piece as PDF, into ../Print Materials/
```

## Print

`tools/print.mjs` builds the pamphlet, flyers, both cabins' welcome and
checkout signs, both welcome binders, every QR code (SVG + PNG) and the
OwnerRez message drafts from the same data files, in the site's colours and
type, then renders them into `../Print Materials/`. It serves this folder
itself, so the dev server need not be running. Once: `cd tools && npm install`
(the `qrcode` package). Needs macOS (`sips`) and Chrome. QR codes open the real
domain, so print only after launch; `--origin https://robineastin.vercel.app`
makes a test set in `Print Materials/_Test proofs/`. See DESIGN.md §11.

The generated HTML is committed, so Vercel deploys the folder as-is: no build
step (`vercel.json`). `.vercelignore` keeps tools and notes off the public site.

## Deploy (Vercel)

Import this repo, framework preset **Other**, no build command, output
directory `.` (all already in `vercel.json`). Every push to `main` deploys.
The production `*.vercel.app` address is the share link. Set
`CONFIG.previewOrigin` to it so link previews show the photo.

## OwnerRez

- **Widgets** (booking, calendars, reviews) are live from Robyn's account.
  IDs in `CONFIG.booking`.
- **API** (optional, private use): put `OWNERREZ_EMAIL` and `OWNERREZ_TOKEN`
  in `.env.local` (gitignored) and run `node tools/ownerrez-check.mjs`.
  Never commit or paste the token.

## Launch

See `DESIGN.md` §10. Short version: resolve every `TODO(client)` in
`js/config.js`, set `SAMPLE = false` and `launched`, set each property's public
URL in OwnerRez, disable the OwnerRez hosted website, then point the domain at
Vercel in Namecheap (leave the email records alone).
