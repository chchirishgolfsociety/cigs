# Handoff notes — Christchurch Irish Golf Society website

Context for picking this project up in Claude Code / VS Code. The technical
setup and maintenance steps live in `README.md` — this doc is the "why" behind
the decisions so far, and what's still open.

## What this is
A mobile-first static website for the Christchurch Irish Golf Society, styled
after the Liverpool FC site's layout (hamburger-left / crest-center /
sponsor-right on mobile; crest-left / nav-center / sponsor-right on desktop).
No backend yet — the Race and Events pages read live from the club's Google
Sheet as CSV. Built to host on GitHub Pages, with a database backend planned
as a later phase.

## Where things stand
- **Pages built:** Home, Race (live leaderboard), Events (live calendar),
  About, Honours Board (past Captains/winners).
- **Brand assets in place:** club crest (`assets/crest.png`) and the real
  Cook Costello sponsor logo (`assets/cook-costello-logo.png`).
- **Palette derived from the crest:** deep navy `#10203f` as the site's base
  background (the brief specifically asked for this — "navy like Liverpool's
  red"), kelly green `#1c8f49` / `#0f5b2d`, a muted gold `#c7a038` for
  previous Race winners, and a silver `#9aa5b4` for this season's event
  winners — both echoing the ✪ symbols already used in the club's own sheet.
- **Type:** Fraunces (display) + Inter (body/UI), loaded via Google Fonts.
- **Leaderboard:** a scrollable table mirroring the sheet's own layout —
  Player and Score columns pinned (sticky) on the left, one column per event
  scrolling alongside. Event-winner stars (silver) are computed live from
  each round's top score; previous-Race-winner stars (gold) come from the
  sheet's own `✪` marks.
- **Data source:** `js/sheet.js` fetches the Race tab of the club's Google
  Sheet directly as CSV (`gviz/tq?tqx=out:csv`) — no API key, no backend.
  Both `race.js` (leaderboard) and `events.js` (calendar) use it. Sheet ID
  and the Race tab's `gid` are constants at the top of `js/sheet.js`.

## File structure
```
index.html          Home
race.html            Race to Hanmer leaderboard
events.html          Event calendar
about.html            About the society
honours.html           Honours Board (past Captains, Race + Match Play winners)
css/style.css         All styles (single stylesheet, CSS custom properties for the palette)
js/layout.js           Shared header + footer markup, injected into every page
js/main.js            Nav open/close + active-link highlighting
js/sheet.js            Google Sheet fetch + CSV parser (shared)
js/race.js              Leaderboard rendering + search
js/events.js             Event list rendering
assets/crest.png          Club crest
assets/cook-costello-logo.png   Sponsor logo
README.md              Setup, hosting, and maintenance instructions
```

## Open items
- **Honours Board history** — Captains and Race winners for past years are
  filled in (`honours.html`); Match Play winners are still marked "—" and
  need the committee to confirm.
- **Social links** — Facebook and Instagram URLs are placeholders
  (`facebook.com`, `instagram.com`), and the email address
  (`info@chchirishgolf.co.nz`) is a guess. Update across all four pages
  (search for `social-pill` and `mailto:`).
- **Domain / hosting** — not yet decided whether this sits on the default
  `github.io` URL or a custom domain.

## Suggested next steps in Claude Code
1. `git init`, create the GitHub repo, push this folder as-is.
2. Turn on GitHub Pages (Settings → Pages → Deploy from branch → `main` /
   root) and confirm the live Race/Events pages actually pull from the sheet
   over `https://` (they won't work opened as a local `file://`, see README).
3. Knock out the open items above.
4. When ready for Phase 2: swap `fetchRaceData()` in `js/sheet.js` for a
   Supabase/Firebase-backed version, and add a simple admin page for entering
   scores — the rest of the site (rendering, styling) shouldn't need to
   change, since everything downstream already just consumes whatever
   `fetchRaceData()` returns.
