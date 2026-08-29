/* ============================================================
   Match Play bracket. Data comes from the "Matchplay" sheet tab
   as a flat list of matches — no explicit "feeds into" column,
   the bracket shape is inferred purely from row order: within a
   round, match 1 & 2 feed round-below match 1, match 3 & 4 feed
   match 2, and so on (standard single-elimination pairing).

   Drawn with CSS Grid: a round's matches are placed on a shared
   row-track grid where each match spans 2x the row-units of the
   round before it, which both centers it between its two feeders
   and gives a fixed, computable distance for the connector lines
   (see ROW_UNIT below). The whole thing is wider than a phone
   screen, so it just scrolls horizontally there rather than having
   a separate mobile layout.
   ============================================================ */

const ROW_UNIT = 44; // px — half of a first-round match box's row-span (must comfortably fit a two-row match card plus breathing room, since row-gap is 0 to keep the connector-line math exact)

document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("matchplay-status");
  const desktopEl = document.getElementById("bracket-desktop");

  let matches;
  try {
    matches = await fetchMatchplay();
  } catch (err) {
    status.textContent = "Couldn't load the Match Play draw right now — please try again shortly.";
    console.error(err);
    return;
  }

  if (!matches.length) {
    status.textContent = "The Match Play draw hasn't been set yet.";
    return;
  }
  status.textContent = "";

  // Group into rounds, preserving first-seen order.
  const rounds = [];
  matches.forEach((m) => {
    let round = rounds.find((r) => r.name === m.round);
    if (!round) {
      round = { name: m.round, matches: [] };
      rounds.push(round);
    }
    round.matches.push(m);
  });

  // Show the still-to-come Final as an empty match once the draw is down
  // to two semi-final matches and the sheet doesn't have a Final row yet,
  // so the bracket reads as a complete tree.
  const lastRound = rounds[rounds.length - 1];
  if (lastRound.name !== "Final" && lastRound.matches.length === 2) {
    rounds.push({
      name: "Final",
      trophy: true,
      matches: [{ player1: "", player2: "", winner: "" }],
    });
  } else if (lastRound.name === "Final") {
    lastRound.trophy = true;
  }

  buildBracket(rounds);

  function playerRow(name, match) {
    const div = document.createElement("div");
    div.className = "bracket-player";
    if (match.winner) {
      div.classList.add(name === match.winner ? "is-winner" : "is-loser");
    }
    // A non-breaking space ( ), not a plain space — a plain space is
    // "collapsible" and renders at near-zero height when it's a block's
    // only content, which shrank blank rows below a populated row's height.
    div.textContent = name || " ";
    return div;
  }

  function matchEl(match, round) {
    const el = document.createElement("div");
    el.className = "bracket-match";
    if (round && round.trophy) {
      el.classList.add("bracket-match-trophy");
      const trophy = document.createElement("div");
      trophy.className = "bracket-trophy";
      trophy.textContent = "\u{1F3C6}";
      el.appendChild(trophy);
    }
    el.appendChild(playerRow(match.player1, match));
    el.appendChild(playerRow(match.player2, match));
    return el;
  }

  function buildBracket(rounds) {
    const firstRoundCount = rounds[0].matches.length;
    const totalRows = firstRoundCount * 2;

    rounds.forEach((round, r) => {
      const span = Math.pow(2, r + 1);
      const connectorHalf = Math.pow(2, r) * ROW_UNIT;
      const hasNext = r < rounds.length - 1;
      const hasPrev = r > 0;

      const roundEl = document.createElement("div");
      roundEl.className = "bracket-round";

      const head = document.createElement("div");
      head.className = "bracket-round-head";
      head.innerHTML = `<p class="bracket-round-name">${round.name}</p>`;
      roundEl.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "bracket-round-grid";
      grid.style.gridTemplateRows = `repeat(${totalRows}, ${ROW_UNIT}px)`;
      grid.style.setProperty("--connector-half", `${connectorHalf}px`);

      round.matches.forEach((match, i) => {
        const el = matchEl(match, round);
        if (hasNext) {
          el.classList.add("has-next", i % 2 === 0 ? "pair-top" : "pair-bottom");
        }
        if (hasPrev) el.classList.add("has-prev");

        const rowStart = i * span + 1;
        el.style.gridRow = `${rowStart} / span ${span}`;
        grid.appendChild(el);
      });

      roundEl.appendChild(grid);
      desktopEl.appendChild(roundEl);
    });
  }
});
