document.addEventListener("DOMContentLoaded", async () => {
  const board = document.getElementById("leaderboard");
  const status = document.getElementById("race-status");
  const search = document.getElementById("race-search");
  const legendEl = document.getElementById("race-legend");

  let data;
  try {
    data = await fetchRaceData();
  } catch (err) {
    status.textContent = "Couldn't load the Race sheet right now — please try again shortly.";
    console.error(err);
    return;
  }

  status.textContent = `${data.players.length} players · updated live from the club sheet`;

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
  // Gold stars are the sheet's own "✪" marks, which now mean only
  // "previous Race winner" — a fact that isn't in this season's data.
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
    winners.forEach((p) => eventWinCounts.set(p, (eventWinCounts.get(p) || 0) + 1));
  });

  function starsMarkup(p) {
    const eventWins = eventWinCounts.get(p) || 0;
    const raceWins = (p.stars.match(/✪/g) || []).length;
    if (!eventWins && !raceWins) return "";
    const eventStars = eventWins ? `<span class="star-event" title="Won ${eventWins} event${eventWins > 1 ? "s" : ""} this season">${"✪".repeat(eventWins)}</span>` : "";
    const raceStars = raceWins ? `<span class="star-winner" title="Previous Race winner">${"✪".repeat(raceWins)}</span>` : "";
    return `<span class="lb-stars">${eventStars}${raceStars}</span>`;
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
        <td class="lb-col-name">${p.name}${starsMarkup(p)}</td>
        <td class="lb-col-score">${p.score}</td>
        ${cells}
      </tr>
    `;
  }

  function render(filter) {
    const f = (filter || "").trim().toLowerCase();
    const filtered = sortPlayers(data.players.filter((p) => p.name.toLowerCase().includes(f)));
    const rows = filtered.length
      ? filtered.map(renderRow).join("")
      : `<tr><td colspan="${data.eventCols.length + 2}" style="text-align:center;padding:20px">No players match "${filter}".</td></tr>`;

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
    render(search.value);
  });

  render("");
  search.addEventListener("input", (e) => render(e.target.value));
});
