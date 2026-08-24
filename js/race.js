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
    <span><i class="dot" style="background:var(--green)"></i> Round played</span>
    <span><i class="dot" style="background:var(--line)"></i> Not yet played</span>
    <span><i class="dot" style="background:var(--gold)"></i> Hanmer (final)</span>
    <span>✪ Previous Race winner</span>
  `;

  function renderRow(p, rank) {
    const trail = data.eventCols
      .map((ec, i) => {
        const val = p.cells[i];
        const played = val && val !== "-";
        const isHanmer = /hanmer/i.test(ec.name);
        const cls = isHanmer ? "hanmer" : played ? "played" : "";
        const title = `${ec.name}${ec.date ? " (" + ec.date + ")" : ""}: ${played ? val : "not played"}`;
        return `<span class="dot ${cls}" title="${title}"></span>`;
      })
      .join("");

    return `
      <li class="lb-row ${rank <= 3 ? "is-top3" : ""}">
        <div class="lb-rank">${rank}</div>
        <div>
          <div class="lb-name">${p.name}${p.stars ? `<span class="lb-stars">${p.stars}</span>` : ""}</div>
          <div class="lb-trail">${trail}</div>
        </div>
        <div class="lb-score">${p.score}<span class="unit">points</span></div>
      </li>
    `;
  }

  function render(filter) {
    const f = (filter || "").trim().toLowerCase();
    const filtered = data.players.filter((p) => p.name.toLowerCase().includes(f));
    board.innerHTML = filtered
      .map((p) => renderRow(p, data.players.indexOf(p) + 1))
      .join("");
    if (!filtered.length) {
      board.innerHTML = `<li class="race-status" style="padding:20px">No players match "${filter}".</li>`;
    }
  }

  render("");
  search.addEventListener("input", (e) => render(e.target.value));
});
