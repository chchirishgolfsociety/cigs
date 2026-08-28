/* ============================================================
   Shared header + footer, injected into every page.
   Edit the nav/footer here once — it applies everywhere.
   Runs as a plain synchronous script (not on DOMContentLoaded)
   so the markup exists before js/main.js wires up the hamburger.
   ============================================================ */

document.getElementById("site-header").innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <div class="nav-bar">
      <button class="hamburger" aria-label="Open menu" aria-expanded="false">
        <span></span>
      </button>
      <a class="nav-brand" href="index.html">
        <img src="assets/crest.png" alt="Christchurch Irish Golf Society crest">
      </a>
      <nav class="nav-links" aria-label="Main">
        <a href="index.html">Home</a>
        <a href="events.html">Events</a>
        <a href="race.html">Race</a>
        <a href="honours.html">Honours Board</a>
        <a href="https://www.oneills.com/int_en/shop-by-team/pitch-and-putt/christchurch-irish-golf-society.html" target="_blank" rel="noopener">Pro Shop</a>
      </nav>
      <div class="sponsor-slot">
        <a href="https://www.coco.co.nz/" target="_blank" rel="noopener">
          <img src="assets/cook-costello-logo.png" alt="Cook Costello, club sponsor">
        </a>
      </div>
    </div>
    <div class="nav-scrim"></div>
  </header>
`;

document.getElementById("site-footer").innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="assets/crest.png" alt="">
          <span>Chch Irish Golf Society</span>
        </div>
        <div class="footer-social">
          <span class="footer-social-label">Give us a follow</span>
          <a href="https://www.facebook.com/chchirishgolfsociety" target="_blank" rel="noopener" aria-label="Facebook">
            <svg viewBox="0 0 24 24"><path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.46 1.5-1.46H16.5V4.36C16.2 4.32 15.2 4.24 14 4.24c-2.4 0-4 1.46-4 4.14V10.5H7.5v3H10V21h3.5z"/></svg>
          </a>
          <a href="https://www.instagram.com/chchirishgolfsociety" target="_blank" rel="noopener" aria-label="Instagram">
            <svg viewBox="0 0 24 24"><path d="M12 2c2.7 0 3.05.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.89 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.07.06 1.42.06 4.12s-.01 3.05-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.07.05-1.42.06-4.12.06s-3.05-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.05 2 14.7 2 12s.01-3.05.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.45.53C6.09.28 6.82.11 7.88.06 8.95.01 9.3 0 12 0zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.4a1.17 1.17 0 1 1 0-2.34 1.17 1.17 0 0 1 0 2.34z"/></svg>
          </a>
          <a href="mailto:chchirishgolfsociety@gmail.com" aria-label="Email">
            <svg viewBox="0 0 24 24"><path d="M2 5h20v14H2V5zm2 2.5V17h16V7.5l-8 5.5-8-5.5zm.8-.5L12 11.2 19.2 7H4.8z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Christchurch Irish Golf Society. Kindly sponsored by Cook Costello.</span>
      </div>
    </div>
  </footer>
`;
