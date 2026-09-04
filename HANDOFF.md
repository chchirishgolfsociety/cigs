# Handoff notes — Christchurch Irish Golf Society website

Context for picking this project up in Claude Code / VS Code. The technical
setup and maintenance steps live in `README.md` — this doc is the "why"
behind the decisions so far, and what's still open.

## What this is
A mobile-first static website for the Christchurch Irish Golf Society,
hosted on GitHub Pages under a dedicated GitHub account
(`chchirishgolfsociety`, separate from the user's personal account, created
deliberately for this project) and served at the custom domain
`chchirishgolfsociety.co.nz` (registered through iwantmyname; see
README.md's "Custom domain" section for the DNS/CNAME setup). No backend —
the Race and Events pages read live from the club's Google Sheet as CSV;
the Honours Board is manually maintained HTML. A database backend is a
possible later phase, not started.

## Pages
- **Home** (`index.html`) — Hero with a swipeable/click-through photo
  carousel (`js/hero-carousel.js`, photos in `assets/photos/`, currently
  14), then "Who we are" and "Get involved" sections. This copy used to be
  a separate `about.html`; removed once it became redundant with the
  homepage.
- **Race** (`race.html`) — Cook Costello Race to Hanmer leaderboard, see
  "Race leaderboard" below for the interesting parts. Hero includes last
  year's Race winner photo.
- **Match Play** (`matchplay.html`) — Knockout bracket, see "Match Play
  bracket" below for the interesting parts. Hero includes last year's
  Match Play winner photo.
- **Events** (`events.html`) — Reads the Schedule tab; shows only planned
  (future) events, soonest first, with the entry price in place of a
  status tag.
- **Honours Board** (`honours.html`) — Past Captains / Race winners / Match
  Play winners, hand-maintained (not sheet-driven).

## Nav & shared chrome (`js/layout.js`)
Single source for the header and footer, injected into every page via
`<div id="site-header">` / `<div id="site-footer">` — edit once, applies
everywhere.
- **Desktop nav** (≥860px): crest left, links centered, Cook Costello
  sponsor logo right.
- **Mobile nav**: hamburger left, crest centered, sponsor logo right
  (styled after the Liverpool FC site's layout, per the original brief —
  "navy like Liverpool's red"). The mobile drawer additionally has the
  crest (top-left) and a close (X) button (top-right), both pinned 28px
  from their respective edges, and the three social icons at the bottom
  — all hidden on desktop where they'd duplicate the header/footer.
- **Footer**: crest + name (name hidden below 640px — mobile shows just the
  crest), social icons (Facebook/Instagram from Simple Icons, email from
  Google Material Symbols) with a "Get in touch" label, copyright line.
- Nav order: Home, Events, Race, Match Play, Honours Board, Pro Shop
  (external link to the club's O'Neills team store).

## File map
```
index.html, race.html, matchplay.html, events.html, honours.html   The five pages
css/style.css        Single stylesheet, custom properties for the palette
js/layout.js          Shared header/footer/nav, injected into every page
js/main.js             Hamburger open/close, active-link highlighting
js/sheet.js             Google Sheet fetch + CSV parser (fetchRaceData, fetchSchedule, fetchMatchplay)
js/race.js               Race table rendering, sorting, stars, positions
js/matchplay.js           Match Play bracket rendering (CSS Grid, same layout at every width)
js/events.js              Events list rendering
js/hero-carousel.js        Homepage photo carousel (click/swipe/dots)
assets/photos/             Homepage carousel photos
assets/crest.png, cook-costello-logo.png   Club crest, sponsor logo
assets/2025_race.jpg, 2025_matchplay.jpg   Winner photos shown on race.html / matchplay.html
assets/countycolours/       Parked feature, see "Known dead-end" below
```

## Data sources (`js/sheet.js`)
All via the Google Sheets `gviz/tq` CSV export — no API key, no backend.
`SHEET_ID` and `RACE_GID` are constants at the top of the file.
- `fetchRaceData()` — Race tab. Header row detected by column B ending in
  "PLAYER NAME" (tolerates a title/sponsor banner sharing the cell) and
  column C being "SCORE". Event columns run from column E until the first
  blank header.
- `fetchSchedule()` — Schedule tab, looked up by name. Columns: Date,
  Course, Entry, optional Green Fee.
- `fetchMatchplay()` — Matchplay tab, looked up by name. Columns: Round,
  Player 1, Player 2, Winner. See "Match Play bracket" below for how the
  bracket shape is inferred from this flat list.

## Race leaderboard (`js/race.js`)
A few things here aren't obvious from just reading the page:
- **POS column**: tie-aware ranking — two players tied for 4th both show
  `T4`, the next distinct score jumps to 6th (standard sports ranking).
  Sortable like every other column.
- **Gold stars** ("previous Race winner") come from a hardcoded
  `PREVIOUS_RACE_WINNERS` array in `race.js`, *not* the sheet's own `✪`
  marks (that history isn't in the current season's data at all — it has
  to be kept in sync by hand with `honours.html` whenever a new Race is
  won).
- **Silver stars** ("event winner this season") are computed live: highest
  score in a round's column wins it. This can't see countback or scoring
  format differences (e.g. an Irish stableford round), so there's a small
  `EVENT_WINNER_OVERRIDES` map for the two known cases where the raw score
  alone picked the wrong player.
- **Struck-through ("non-counter") scores**: the sheet's `SCORE` column is
  already "best 6 regular events + Hanmer", not a sum of everything
  played. `race.js` reverse-engineers which cells count by taking each
  player's own top 6 regular scores (Hanmer always counts, uncapped).
- **Table layout**: `table-layout: fixed` with a uniform per-column width
  — without it, columns varied in width based on how long their header
  text was. Mobile gets its own narrower widths, and there's a
  `max-height` media-query trick so a phone rotated to landscape (wide but
  short viewport) still gets the compact mobile styling instead of reading
  as "desktop".
- **Dash vs. blank in event columns**: don't trust the sheet's raw cell
  text to decide this — a "didn't play" cell sometimes has a literal `-`
  typed in and sometimes is genuinely empty with a custom number format
  that only *displays* as `-` in Sheets (that formatting doesn't survive
  the CSV export, so it reads back as blank either way). `race.js` instead
  marks a column as "played" once *any* player has a real score in it —
  blank cells in a played column render as `-`, blank cells in a column
  nobody's played yet stay genuinely blank.

## Match Play bracket (`js/matchplay.js`)
- **Bracket shape**: inferred purely from row order within the Matchplay
  sheet tab — there's no explicit "feeds into" column. Match 1 & 2 in a
  round feed match 1 of the next round, 3 & 4 feed match 2, and so on.
  This means **Player 1 must always be the winner from the top half of a
  pairing, Player 2 the bottom half** — the page trusts column order and
  doesn't cross-check against the previous round's results, so a name in
  the wrong column renders in the wrong half of its box (see the README's
  Matchplay tab notes).
- **Layout**: drawn with CSS Grid rather than JS-computed pixel positions,
  and used unchanged at every viewport width. Every round shares the same
  row-track grid (`totalRows` = 2 × the first round's match count); a
  round-*r* match spans `2^(r+1)` row-units and starts at `i * span + 1`,
  which both centers it between its two feeders and gives a *fixed,
  computable* distance (`2^r * ROW_UNIT`) between paired matches — that
  distance is what the `::before`/`::after` connector lines use, so the
  lines always meet exactly at the midpoint between columns regardless of
  round depth. `row-gap` is deliberately 0 to keep that math exact.
- **Mobile**: no separate layout — the bracket is wider than a phone
  screen, so `.bracket-desktop` just scrolls horizontally
  (`overflow-x: auto`) rather than switching to a different view. An
  earlier one-round-per-swipeable-page mobile mode was tried and dropped
  for being buggy; plain horizontal scroll is simpler and more reliable.
- **Champion / trophy slot**: once the last round in the sheet has two
  matches (i.e. it's the Semi Finals and no Final row exists yet),
  `matchplay.js` auto-inserts an empty placeholder "Final" round so the
  bracket still reads as a complete tree. Once a real Final row is added
  to the sheet, that takes over automatically and just gets the trophy
  icon attached (see the `round.trophy` flag).

## Brand / design
- Palette from the crest: deep navy `#10203f` base background (per the
  brief, "navy like Liverpool's red"), kelly green `#1c8f49` / `#0f5b2d`,
  gold `#c7a038` (previous Race winners), silver `#9aa5b4` (this season's
  event winners) — gold/silver echo the ✪ symbols already used in the
  club's own sheet.
- Type: Fraunces (display) + Inter (body/UI), Google Fonts.
- Icons: sourced from [Simple Icons](https://simpleicons.org) (brand
  logos — Facebook, Instagram) and [Google Material
  Symbols](https://fonts.google.com/icons) (generic UI — mail, the
  rotate-device hint on the Race page). Hand-drawn icon paths were tried
  first and looked soft/smudgy at small sizes; these read much better.

## Known dead-end / parked work
- **`assets/countycolours/`** — GAA county-colour flag SVGs (Cork, Kerry,
  Waterford, etc.), meant to show a small flag next to a player's name on
  the Race table based on a "Home County" column added to the Player Info
  sheet. Built, then reverted: rows with a flag rendered a hair taller
  than rows without one (inline images affect line-box height differently
  than plain text), and an explicit `line-height` didn't fix it. The
  asset files and the Player Info sheet column are still in place if this
  gets revisited — the code just isn't wired up.

## Open items
- **Honours Board — Match Play winners** for years before 2024 are still
  marked "-"; need the committee to confirm.
- **Corporate network false positives** — some workplace security gateways
  flag `chchirishgolfsociety.co.nz` as "uncategorised" (a new/low-traffic
  domain their URL-reputation database hasn't classified yet) and serve it
  through browser isolation. Confirmed happening on a Netskope-protected
  network. Not a site bug — see README.md's "Custom domain" section for
  what this is and how to get a domain recategorized per-vendor.
- **Cache-busting** — GitHub Pages caches static assets for ~10 minutes by
  default; explicitly decided *not* worth adding version-string cache
  busting for this site's traffic pattern.

## Suggested next steps
1. Fill in the remaining Honours Board Match Play winners.
2. Submit `chchirishgolfsociety.co.nz` to the major URL-reputation lookup
   tools (Zscaler, Palo Alto, Cisco Talos, Fortinet, Forcepoint,
   BrightCloud — see README.md) to get ahead of the corporate-gateway
   false-positive issue before it comes up elsewhere.
3. When ready for a real backend: swap `fetchRaceData()` /
   `fetchSchedule()` / `fetchMatchplay()` in `js/sheet.js` for a
   Supabase/Firebase-backed version, with a simple admin page for
   entering scores/events/results — the rest of the site (rendering,
   styling) shouldn't need to change, since everything downstream already
   just consumes whatever those functions return.
4. Revisit `assets/countycolours/` if the county-flag feature is wanted
   again (see "Known dead-end" above for what went wrong last time).
