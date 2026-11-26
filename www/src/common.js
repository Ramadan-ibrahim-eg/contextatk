// Small script shared by the landing page and the information pages. Served at /common.js.
// 1) Language: picks the saved or browser language early (the app script takes over on the app page).
// 2) Cookie notice: short and informational, dismissed with a button. The dismissal is kept in
//    localStorage (not a cookie).
export const COMMON = `(function () {
  var de = document.documentElement;
  var lang = "";
  try { lang = localStorage.getItem("lang") || ""; } catch (e) {}
  if (lang !== "ar" && lang !== "en") lang = (navigator.language || "").indexOf("ar") === 0 ? "ar" : "en";
  de.lang = lang;
  de.dir = lang === "ar" ? "rtl" : "ltr";

  var btn = document.getElementById("lang");
  if (btn && !document.getElementById("app")) {
    var label = function () { btn.textContent = lang === "ar" ? "English" : "العربية"; };
    label();
    btn.addEventListener("click", function () {
      lang = lang === "ar" ? "en" : "ar";
      try { localStorage.setItem("lang", lang); } catch (e) {}
      de.lang = lang;
      de.dir = lang === "ar" ? "rtl" : "ltr";
      label();
    });
  }

  try { if (localStorage.getItem("notice")) return; } catch (e) {}
  var bar = document.createElement("div");
  bar.className = "notice-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Cookies");
  bar.innerHTML =
    '<p><span class="en">This site uses only essential cookies: one to keep you signed in and one during sign-in. No ads, no analytics. </span>' +
    '<span class="ar">يستخدم هذا الموقع ملفات تعريف الارتباط الأساسية فقط: واحد لإبقائك مسجّلًا دخولك وآخر أثناء تسجيل الدخول. لا إعلانات ولا تحليلات. </span>' +
    '<a href="/cookies"><span class="en">Cookie Policy</span><span class="ar">سياسة ملفات تعريف الارتباط</span></a></p>' +
    '<button type="button" class="primary"><span class="en">Got it</span><span class="ar">حسنًا</span></button>';
  bar.querySelector("button").addEventListener("click", function () {
    try { localStorage.setItem("notice", "1"); } catch (e) {}
    bar.remove();
  });
  document.body.append(bar);
})();
`;
