# Christchurch Irish Golf Society — website

A small, mobile-first, static site. No build step, no backend — just HTML/CSS/JS,
ready to host on GitHub Pages.

## Pages
- `index.html` — Home
- `race.html` — Race to Hanmer leaderboard (pulls live from your Google Sheet)
- `events.html` — Event calendar (also pulled from the sheet, links out to Facebook)
- `about.html` — About the society

## How the Race data works
`race.html` and `events.html` fetch your **"Chch Irish Golf Society 2026"** Google
Sheet directly, as CSV, using this public endpoint (no API key needed):

```
https://docs.google.com/spreadsheets/d/<SHEET_ID>/gviz/tq?tqx=out:csv&gid=<GID>
```

This is configured in `js/sheet.js`. As long as the sheet stays shared as
**"Anyone with the link — Viewer"**, the site will always show the latest scores
you enter — no need to touch the website when scores change.

**If you ever replace the sheet or the Race tab:**
1. Open the new sheet, click on the *Race* tab.
2. Copy the sheet ID from the URL (the long string after `/d/`) and the tab's
   `gid` (the number after `gid=` at the end of the URL).
3. Update `SHEET_ID` and `RACE_GID` at the top of `js/sheet.js`.

The parser expects the same layout as your current Race tab: a header row with
`PLAYER NAME` in column B and `SCORE` in column C, then one column per event
starting at column E. If you add or remove columns in that range it'll pick
them up automatically — just keep column B/C where they are.

## To do before launch
- [x] **Cook Costello logo** — done (`assets/cook-costello-logo.png`, referenced in every page's `<div class="sponsor-slot">`).
- [x] **About page copy** — done, real copy about the society and committee is in `about.html`.
- [x] **Facebook and Instagram links** — done, both point to `chchirishgolfsociety`.
- [x] **Email address** — done, `chchirishgolfsociety@gmail.com` across all pages.

## Hosting on GitHub Pages
1. Create a repo (e.g. `chch-irish-golf`) and push everything in this folder
   to the `main` branch.
2. In the repo: **Settings → Pages → Source → Deploy from branch → `main` / `root`**.
3. Your site will be live at `https://<your-username>.github.io/chch-irish-golf/`.
4. Optional: add a custom domain under the same Pages settings.

## Local preview
Because the Race/Events pages `fetch()` data, opening the HTML files directly
(`file://`) won't load them (browsers block that for security). Instead, run
a tiny local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. GitHub Pages serves over `https://`, so
this isn't an issue once deployed.

## Later: moving beyond the Google Sheet
When manual sheet upkeep gets old, the natural next step is a small hosted
database (e.g. Supabase or Firebase) with a simple admin page for entering
scores and events, swapped in behind the same `fetchRaceData()` function in
`js/sheet.js` — the rest of the site won't need to change.
