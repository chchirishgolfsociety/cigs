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
      <div class="sponsor-slot">
        <img src="assets/cook-costello-logo.png" alt="Cook Costello, club sponsor">
      </div>
    </div>
    <nav class="nav-links" aria-label="Main">
      <a href="index.html">Home</a>
      <a href="race.html">Race</a>
      <a href="events.html">Events</a>
      <a href="about.html">About</a>
    </nav>
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
        <div class="social-row">
          <a class="social-pill" href="https://www.facebook.com/" target="_blank" rel="noopener" style="background:transparent;border-color:rgba(255,255,255,0.2);color:#fff">Facebook</a>
          <a class="social-pill" href="https://www.instagram.com/" target="_blank" rel="noopener" style="background:transparent;border-color:rgba(255,255,255,0.2);color:#fff">Instagram</a>
          <a class="social-pill" href="mailto:info@chchirishgolf.co.nz" style="background:transparent;border-color:rgba(255,255,255,0.2);color:#fff">Email</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Christchurch Irish Golf Society. Kindly sponsored by Cook Costello.</span>
        <span><a href="race.html">Race to Hanmer</a> &middot; <a href="events.html">Events</a> &middot; <a href="about.html">About</a></span>
      </div>
    </div>
  </footer>
`;
