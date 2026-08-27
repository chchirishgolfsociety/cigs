document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".hero-carousel-track");
  const dotsEl = document.querySelector(".hero-carousel-dots");
  if (!track || !dotsEl) return;

  const slides = Array.from(track.querySelectorAll("img"));
  if (!slides.length) return;

  let current = 0;
  slides[0].classList.add("is-active");

  if (slides.length === 1) return; // nothing to cycle with just one photo

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show photo ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(dot);
  });
  const dots = Array.from(dotsEl.children);
  dots[0].classList.add("is-active");

  function goTo(i) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = i;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
  }
  function next() { goTo((current + 1) % slides.length); }
  function prev() { goTo((current - 1 + slides.length) % slides.length); }

  // Click the photo to advance, or swipe on touch devices.
  track.addEventListener("click", next);

  let touchStartX = null;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 40) {
      // A real swipe — handle it here and stop the browser's follow-up
      // synthetic click from also firing (which would double-advance).
      e.preventDefault();
      dx < 0 ? next() : prev();
    }
    // A simple tap (small dx) falls through to the click handler below.
  });
});
