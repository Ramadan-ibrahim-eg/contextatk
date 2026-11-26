// Light/dark theme. Served at /theme.js and loaded in <head> on every page (it is tiny, and running before
// the page paints avoids a flash). The choice is kept in localStorage ("theme"); without one the system
// preference decides (the CSS also follows it, so the page is right even before this script runs).
export const THEME = `(function () {
  var de = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function saved() { try { var v = localStorage.getItem("theme"); return v === "dark" || v === "light" ? v : ""; } catch (e) { return ""; } }
  function effective() { return saved() || (mq && mq.matches ? "dark" : "light"); }
  function apply() {
    var s = saved();
    if (s) de.setAttribute("data-theme", s); else de.removeAttribute("data-theme");
    var b = document.getElementById("theme");
    if (b) { var d = effective() === "dark"; b.textContent = d ? "\\u2600" : "\\u263E"; b.setAttribute("aria-pressed", d ? "true" : "false"); }
  }
  apply();
  document.addEventListener("DOMContentLoaded", function () {
    apply();
    var b = document.getElementById("theme");
    if (!b) return;
    b.addEventListener("click", function () {
      try { localStorage.setItem("theme", effective() === "dark" ? "light" : "dark"); } catch (e) {}
      apply();
    });
  });
  if (mq && mq.addEventListener) mq.addEventListener("change", apply);
})();
`;
