# Christchurch Irish Golf Society — website

A small, mobile-first, static site. No build step, no backend — just HTML/CSS/JS,
hosted on GitHub Pages at **https://chchirishgolfsociety.github.io/cigs/**.

Repo: `github.com/chchirishgolfsociety/cigs` (note: a separate GitHub account
from any personal one — see `HANDOFF.md` for why).

## Pages
- `index.html` — Home. Hero has a swipeable/click-through photo carousel
  (`assets/photos/`), then "Who we are" and "Get involved" sections (this
  copy used to live on a separate `about.html`; folded into the homepage
  since a standalone About page became redundant).
- `race.html` — Cook Costello Race to Hanmer leaderboard. Live from the
  Race tab, sortable, with Pos/Player/Score pinned while event columns
  scroll horizontally. Hero includes last year's Race winner photo.
- `matchplay.html` — Match Play bracket. Live from the Matchplay tab: a
  connected bracket on desktop, one round per swipeable page on mobile.
  Hero includes last year's Match Play winner photo.
- `events.html` — Upcoming Events. Live from the Schedule tab; only shows
  events that haven't happened yet, with the entry price shown per event.
- `honours.html` — Honours Board. Past Captains, Race winners, and Match
  Play winners — **manually maintained**, not pulled from the sheet.

## How the live data works
`race.html` and `events.html` fetch the club's **"Chch Irish Golf Society 2026"**
Google Sheet directly, as CSV, using this public endpoint (no API key needed):

```
https://docs.google.com/spreadsheets/d/<SHEET_ID>/gviz/tq?tqx=out:csv&gid=<GID>
https://docs.google.com/spreadsheets/d/<SHEET_ID>/gviz/tq?tqx=out:csv&sheet=<TAB NAME>
```

Both are configured in `js/sheet.js`. As long as the sheet stays shared as
**"Anyone with the link — Viewer"**, the site always shows the latest data —
no need to touch the website when scores or the schedule change.

**Race tab** (`fetchRaceData()`, used by `race.html`):
- Header row: column B ends with `PLAYER NAME`, column C is `SCORE` (the
  detection tolerates a title/sponsor banner crammed into the same cell as
  "PLAYER NAME" — matches on `endsWith`, not exact equality).
- One event column per course starting at column E, picked up automatically
  — add or remove columns freely, just keep column B/C where they are.
- The `SCORE` column is already "best 6 regular events + Hanmer", not a sum
  of everything played — `race.js` reverse-engineers which specific cells
  count (for the strikethrough "doesn't count" styling) by taking each
  player's top 6 regular scores and always including Hanmer.

**Schedule tab** (`fetchSchedule()`, used by `events.html`):
- Columns: `Date`, `Course`, `Entry` (green fee shown on the page), and
  optionally `Green Fee` (shown as a second "usual green fee" line when a
  round has one, e.g. the away trips).
- Date format expected: `25 Jan 26` (day, short month, 2-digit year).

**Matchplay tab** (`fetchMatchplay()`, used by `matchplay.html`):
- Columns: `Round`, `Player 1`, `Player 2`, `Winner`. One row per match —
  there's no "feeds into" column, the bracket shape is inferred purely
  from row order within a round (match 1 & 2 feed match 1 of the next
  round, 3 & 4 feed match 2, and so on — standard bracket pairing).
- **Important:** within a round, keep `Player 1` as the winner from the
  *top* half of that pairing and `Player 2` as the winner from the
  *bottom* half — the page trusts column order to decide which half of
  the box a name renders in, it doesn't cross-check against the previous
  round. Add the next round's row as soon as one side is known (leaving
  the other player cell blank) so the bracket shows partial progress.
- Once the draw is down to two Semi Final matches, a "Final" row can be
  added; the page also auto-inserts an empty placeholder Final slot with
  a trophy if the sheet doesn't have one yet, so the bracket always reads
  as a complete tree.

**If you ever replace the sheet or a tab:**
1. Open the new sheet, click the relevant tab.
2. Copy the sheet ID from the URL (the string after `/d/`) and the tab's
   `gid` (the number after `gid=` at the end of the URL, for the Race tab).
3. Update `SHEET_ID` / `RACE_GID` at the top of `js/sheet.js`. The Schedule
   and Matchplay tabs are both looked up by name (`sheet=Schedule` /
   `sheet=Matchplay`), so they only need updating if you rename those tabs.

## Honours Board — keeping it in sync
`honours.html`'s table is hand-edited HTML, not pulled from the sheet.
Things to update manually when a season wraps up:
1. Add the new year's row to the table in `honours.html`.
2. Add the Race winner's name to the `PREVIOUS_RACE_WINNERS` list at the
   top of `js/race.js` — this is what gives a player their gold "previous
   winner" star on the live leaderboard. Format: `"Surname, First"`,
   matching how names appear in the Race tab.
3. Swap the winner photos on `race.html` and `matchplay.html` (in the
   hero, next to the page title) to the new year's — update the `<img>`
   src and the caption's name in both files.

## Editing the shared header/footer/nav
`js/layout.js` injects the header (crest, nav links, sponsor logo, mobile
drawer) and footer (crest, social icons) into every page from one place —
edit it once, it applies everywhere. Don't edit the header/footer markup
in the individual `.html` files; they just have an empty
`<div id="site-header"></div>` / `<div id="site-footer"></div>` for
`layout.js` to fill in.

## Hosting on GitHub Pages
Already set up — **Settings → Pages → Source → Deploy from branch → `main` /
`root`** on the `chchirishgolfsociety/cigs` repo. A push to `main` typically
goes live within ~30–60 seconds. Browsers may cache CSS/JS/images for up to
10 minutes (GitHub Pages' default `Cache-Control: max-age=600`) before
picking up a change — that's expected and hasn't been worth changing.

## Local preview
Because the Race/Events pages `fetch()` data, opening the HTML files
directly (`file://`) won't load them (browsers block that for security).
Instead, run a tiny local server from this folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. GitHub Pages serves over `https://`, so
this isn't an issue once deployed.

**Note:** if you're testing a change and it doesn't seem to appear (locally
*or* on the live site), it's almost always the browser caching the old
version — hard refresh (Ctrl+Shift+R on desktop; on iOS/Chrome mobile, use
a private/incognito tab) before assuming something's broken.

## Later: moving beyond the Google Sheet
When manual sheet upkeep gets old, the natural next step is a small hosted
database (e.g. Supabase or Firebase) with a simple admin page for entering
scores and events, swapped in behind the same `fetchRaceData()` /
`fetchSchedule()` functions in `js/sheet.js` — the rest of the site
shouldn't need to change, since everything downstream just consumes
whatever those functions return.
