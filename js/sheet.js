/* ============================================================
   Pulls live data from the "Race to Hanmer" Google Sheet.
   No backend needed — reads the public sheet as CSV.

   IMPORTANT (see README.md "Updating the Race data"):
   The sheet must stay shared as "Anyone with the link — Viewer".
   If you ever change the sheet ID or the Race tab, update the
   two constants below.
   ============================================================ */

const SHEET_ID = "1-5TZWP6FDgMnofBF5knFpQHcZfkzhdcWdY_X2BDu5Rc";
const RACE_GID = "436701438";
const SCHEDULE_SHEET_NAME = "Schedule";

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function sheetCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

function sheetCsvUrlByName(name) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
}

/** Parses a "25 Jan 26" style date into a Date, or null if unrecognised. */
function parseScheduleDate(raw) {
  const m = (raw || "").trim().match(/(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2,4})/);
  if (!m) return null;
  const mon = MONTHS[m[2].toLowerCase().slice(0, 3)];
  if (mon === undefined) return null;
  let year = parseInt(m[3], 10);
  if (year < 100) year += 2000;
  return new Date(year, mon, parseInt(m[1], 10));
}

/** Minimal CSV parser that handles quoted fields containing commas. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      rows.push(row); row = [];
    } else if (c === "\r") {
      /* skip */
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/**
 * Fetches the Race tab and returns:
 *  { eventCols: [{ index, name, date }], players: [{ stars, name, score, cells:[...] }] }
 */
async function fetchRaceData() {
  const res = await fetch(sheetCsvUrl(RACE_GID));
  if (!res.ok) throw new Error("Could not load the sheet (" + res.status + ")");
  const csv = await res.text();
  const rows = parseCsv(csv);

  // Find the header row: column B ends with "PLAYER NAME" (it may also
  // carry a title/sponsor banner crammed into the same cell) and column C
  // is "SCORE".
  const headerIdx = rows.findIndex(
    (r) =>
      (r[1] || "").trim().toUpperCase().endsWith("PLAYER NAME") &&
      (r[2] || "").trim().toUpperCase() === "SCORE"
  );
  if (headerIdx === -1) throw new Error("Couldn't find the header row in the sheet");
  const header = rows[headerIdx];

  // Event columns start at index 4 (col E) and run until an empty header
  const eventCols = [];
  for (let i = 4; i < header.length; i++) {
    const raw = (header[i] || "").trim();
    if (!raw) break;
    const dateMatch = raw.match(/([A-Za-z]{3,})\s+(\d{1,2})\s*$/);
    eventCols.push({
      index: i,
      name: dateMatch ? raw.slice(0, dateMatch.index).trim() : raw,
      date: dateMatch ? `${dateMatch[1]} ${dateMatch[2]}` : null,
    });
  }

  const players = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const name = (row[1] || "").trim();
    const score = parseFloat(row[2]);
    if (!name || Number.isNaN(score)) continue; // skips blanks + footer notes
    players.push({
      name,
      score,
      cells: eventCols.map((ec) => (row[ec.index] || "").trim()),
    });
  }

  players.sort((a, b) => b.score - a.score);

  return { eventCols, players };
}

/**
 * Fetches the Schedule tab and returns a list of
 * { date: Date|null, course: string, entry: string, greenFee: string },
 * in sheet order.
 */
async function fetchSchedule() {
  const res = await fetch(sheetCsvUrlByName(SCHEDULE_SHEET_NAME));
  if (!res.ok) throw new Error("Could not load the schedule (" + res.status + ")");
  const csv = await res.text();
  const rows = parseCsv(csv);

  const headerIdx = rows.findIndex(
    (r) => (r[0] || "").trim().toUpperCase() === "DATE" && (r[1] || "").trim().toUpperCase() === "COURSE"
  );
  if (headerIdx === -1) throw new Error("Couldn't find the header row in the schedule");
  const header = rows[headerIdx];
  const entryIdx = header.findIndex((h) => (h || "").trim().toUpperCase() === "ENTRY");
  const greenFeeIdx = header.findIndex((h) => (h || "").trim().toUpperCase() === "GREEN FEE");

  const events = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const course = (row[1] || "").trim();
    if (!course) continue;
    const entry = entryIdx !== -1 ? (row[entryIdx] || "").trim() : "";
    const greenFee = greenFeeIdx !== -1 ? (row[greenFeeIdx] || "").trim() : "";
    events.push({ date: parseScheduleDate(row[0]), course, entry, greenFee });
  }
  return events;
}
