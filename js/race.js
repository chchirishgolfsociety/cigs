document.addEventListener("DOMContentLoaded", async () => {
  const board = document.getElementById("leaderboard");
  const status = document.getElementById("race-status");
  const legendEl = document.getElementById("race-legend");

  let data;
  try {
    data = await fetchRaceData();
  } catch (err) {
    status.textContent = "Couldn't load the Race sheet right now — please try again shortly.";
    console.error(err);
    return;
  }

  status.textContent = "";

  legendEl.innerHTML = `
    <span><span class="lb-stars"><span class="star-event">✪</span></span> Event winner this season</span>
    <span><span class="lb-stars"><span class="star-winner">✪</span></span> Previous Race winner</span>
  `;

  // Season rank is fixed at load (players arrive sorted by score, highest
  // first) so the top-3 highlight always reflects the real standings, even
  // when the table below is sorted by some other column.
  data.players.forEach((p, i) => { p.rank = i + 1; });

  // Grey stars mark this year's event winners, computed live from the
  // scores we already have (highest score in a round's column = winner).
  // This can't see countback or format differences (e.g. an Irish
  // stableford round), so a tie on raw score doesn't always mean a tie
  // in reality — override the auto-detected winner(s) here when that
  // happens.
  const EVENT_WINNER_OVERRIDES = {
    "Kaiapoi": ["Ruane, Eugene"], // tied with Ryan, Shane on score; won on countback
    "Bottle L": ["Curtin, John"], // tied with Smyth, Elaine on score; won on countback
  };

  const eventWinCounts = new Map();
  data.eventCols.forEach((ec, i) => {
    let best = -Infinity;
    let winners = [];
    data.players.forEach((p) => {
      const val = p.cells[i];
      if (!val || val === "-") return;
      const n = parseFloat(val);
      if (Number.isNaN(n)) return;
      if (n > best) { best = n; winners = [p]; }
      else if (n === best) { winners.push(p); }
    });
    const override = EVENT_WINNER_OVERRIDES[ec.name];
    if (override) {
      winners = data.players.filter((p) => override.some((n) => n.toLowerCase() === p.name.toLowerCase()));
    }
    winners.forEach((p) => eventWinCounts.set(p, (eventWinCounts.get(p) || 0) + 1));
  });

  // Gold stars mark previous Race winners, sourced from the Honours Board
  // (honours.html) rather than the sheet, since that history isn't part
  // of this season's data. Keep this list in sync with that page.
  const PREVIOUS_RACE_WINNERS = [
    "Farrell, Patrick",   // 2025
    "Daly, Mícheál",      // 2024
    "Skehill, Alan",      // 2023
    "Dunphy, Anthony",    // 2022
    "McGlynn, Kieran",    // 2021
    "Connell, Martin",    // 2020
    "Kinsella, Martin",   // 2019
  ];

  function raceWinCount(p) {
    return PREVIOUS_RACE_WINNERS.filter((n) => n.toLowerCase() === p.name.toLowerCase()).length;
  }

  // Gold (previous winner) stars sit after the name, before the grey
  // (this season's event winner) stars.
  function raceStarsMarkup(p) {
    const raceWins = raceWinCount(p);
    if (!raceWins) return "";
    return `<span class="lb-stars"><span class="star-winner" title="Previous Race winner">${"✪".repeat(raceWins)}</span></span>`;
  }

  function eventStarsMarkup(p) {
    const eventWins = eventWinCounts.get(p) || 0;
    if (!eventWins) return "";
    return `<span class="lb-stars"><span class="star-event" title="Won ${eventWins} event${eventWins > 1 ? "s" : ""} this season">${"✪".repeat(eventWins)}</span></span>`;
  }

  let sortKey = "score"; // "name" | "score" | event column index
  let sortDir = -1; // 1 = ascending, -1 = descending

  function sortArrow(key) {
    if (sortKey !== key) return "";
    return `<span class="sort-arrow">${sortDir === 1 ? "▲" : "▼"}</span>`;
  }

  function cellValue(p, key) {
    if (key === "name") return p.name.toLowerCase();
    if (key === "score") return p.score;
    const val = p.cells[key];
    if (!val || val === "-") return null;
    const n = parseFloat(val);
    return Number.isNaN(n) ? null : n;
  }

  function sortPlayers(players) {
    return [...players].sort((a, b) => {
      const av = cellValue(a, sortKey);
      const bv = cellValue(b, sortKey);
      if (av === null && bv === null) return 0;
      if (av === null) return 1; // unplayed rounds always sink to the bottom
      if (bv === null) return -1;
      if (typeof av === "string") return sortDir * av.localeCompare(bv);
      return sortDir * (av - bv);
    });
  }

  function headerCell(ec, idx) {
    const isSorted = sortKey === idx;
    const title = `${ec.name}${ec.date ? " (" + ec.date + ")" : ""}`;
    return `<th class="${isSorted ? "is-sorted" : ""}" data-sort-key="event:${idx}" title="${title}">${ec.name}${sortArrow(idx)}${ec.date ? `<span class="th-date">${ec.date}</span>` : ""}</th>`;
  }

  function renderRow(p) {
    const cells = data.eventCols
      .map((ec, i) => {
        const val = p.cells[i];
        const played = val && val !== "-";
        return `<td>${played ? val : "–"}</td>`;
      })
      .join("");

    return `
      <tr class="${p.rank <= 3 ? "is-top3" : ""}">
        <td class="lb-col-name">${p.name}${raceStarsMarkup(p)}${eventStarsMarkup(p)}</td>
        <td class="lb-col-score">${p.score}</td>
        ${cells}
      </tr>
    `;
  }

  function render() {
    const rows = sortPlayers(data.players).map(renderRow).join("");

    board.innerHTML = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th class="lb-col-name ${sortKey === "name" ? "is-sorted" : ""}" data-sort-key="name">Player${sortArrow("name")}</th>
            <th class="lb-col-score ${sortKey === "score" ? "is-sorted" : ""}" data-sort-key="score">Score${sortArrow("score")}</th>
            ${data.eventCols.map(headerCell).join("")}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  board.addEventListener("click", (e) => {
    const th = e.target.closest("th[data-sort-key]");
    if (!th) return;
    const raw = th.dataset.sortKey;
    const key = raw.startsWith("event:") ? Number(raw.slice(6)) : raw;
    if (sortKey === key) {
      sortDir *= -1;
    } else {
      sortKey = key;
      sortDir = key === "name" ? 1 : -1;
    }
    render();
  });

  render();
});
