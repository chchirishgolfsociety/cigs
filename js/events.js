const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("events-list");
  const status = document.getElementById("events-status");

  let data;
  try {
    data = await fetchRaceData();
  } catch (err) {
    status.textContent = "Couldn't load events right now — check the club Facebook page in the meantime.";
    console.error(err);
    return;
  }
  status.textContent = "";

  const items = data.eventCols.map((ec) => {
    const played = data.players.some((p) => {
      const v = p.cells[ec.index - 4];
      return v && v !== "-";
    });

    let sortDate = null;
    if (ec.date) {
      const [monStr, dayStr] = ec.date.split(" ");
      const mon = MONTHS[monStr.toLowerCase().slice(0, 3)];
      if (mon !== undefined) sortDate = new Date(2026, mon, parseInt(dayStr, 10));
    }
    return { name: ec.name, date: ec.date, sortDate, played };
  });

  list.innerHTML = items
    .map((ev) => {
      const d = ev.sortDate;
      const dateBlock = d
        ? `<div class="event-date"><span class="day">${d.getDate()}</span><span class="mon">${d.toLocaleString("en-NZ", { month: "short" })}</span></div>`
        : `<div class="event-date"><span class="mon">TBC</span></div>`;
      const tag = ev.played
        ? `<span class="event-tag">Completed</span>`
        : `<span class="event-tag upcoming">Upcoming</span>`;
      return `
        <li class="event-row ${ev.played ? "is-past" : ""}">
          ${dateBlock}
          <div class="event-name">${ev.name}</div>
          ${tag}
        </li>
      `;
    })
    .join("");
});
