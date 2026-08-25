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

function sheetCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
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
