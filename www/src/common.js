// Small script shared by the landing page and the information pages. Served at /common.js.
// Cookie notice: short and informational, dismissed with a button. The dismissal is kept in
//    localStorage (not a cookie).
export const COMMON = `(function () {
  try { if (localStorage.getItem("notice")) return; } catch (e) {}
  var bar = document.createElement("div");
  bar.className = "notice-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Cookies");
  bar.innerHTML =
    '<p>This site uses only essential cookies: one to keep you signed in and one during sign-in. No ads, no analytics. ' +
    '<a href="/cookies">Cookie Policy</a></p>' +
    '<button type="button" class="primary">Got it</button>';
  bar.querySelector("button").addEventListener("click", function () {
    try { localStorage.setItem("notice", "1"); } catch (e) {}
    bar.remove();
  });
  document.body.append(bar);
})();
`;
