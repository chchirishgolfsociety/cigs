document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("events-list");
  const status = document.getElementById("events-status");

  let events;
  try {
    events = await fetchSchedule();
  } catch (err) {
    status.textContent = "Couldn't load events right now - check the club Facebook page in the meantime.";
    console.error(err);
    return;
  }
  status.textContent = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only planned (not yet played) events, chronological, soonest first.
  const planned = events.filter((ev) => !(ev.date && ev.date < today));

  list.innerHTML = planned
    .map((ev) => {
      const d = ev.date;
      const dateBlock = d
        ? `<div class="event-date"><span class="day">${d.getDate()}</span><span class="mon">${d.toLocaleString("en-NZ", { month: "short" })}</span></div>`
        : `<div class="event-date"><span class="mon">TBC</span></div>`;
      const tag = ev.entry
        ? `<div class="event-price">$${ev.entry}${ev.greenFee ? `<span class="green-fee-note">usual green fee: $${ev.greenFee}</span>` : ""}</div>`
        : "";
      return `
        <li class="event-row">
          ${dateBlock}
          <div class="event-name">${ev.course}</div>
          ${tag}
        </li>
      `;
    })
    .join("");
});
