document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const scrim = document.querySelector(".nav-scrim");
  const drawerClose = document.querySelector(".nav-drawer-close");

  function closeNav() {
    navLinks?.classList.remove("is-open");
    scrim?.classList.remove("is-open");
    hamburger?.setAttribute("aria-expanded", "false");
  }
  function openNav() {
    navLinks?.classList.add("is-open");
    scrim?.classList.add("is-open");
    hamburger?.setAttribute("aria-expanded", "true");
  }

  hamburger?.addEventListener("click", () => {
    const isOpen = navLinks.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });
  scrim?.addEventListener("click", closeNav);
  drawerClose?.addEventListener("click", closeNav);
  navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  // Highlight current page in nav
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("is-active");
  });
});
