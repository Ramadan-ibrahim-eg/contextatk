// The admin page and its script (served only to the admin, see admin.js). English only.
export const ADMIN_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>contextatk admin</title>
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="stylesheet" href="/app.css">
  <script src="/theme.js"></script>
</head>
<body>
  <header>
    <a class="brand" href="/admin"><img src="/logo.jpg" alt="" width="32" height="32"><span>contextatk <small>admin</small></span></a>
    <nav><button id="theme" class="link" type="button" aria-label="Dark mode" title="Dark mode"></button><a href="/">Back to the site</a></nav>
  </header>
  <main>
    <section class="card">
      <h2>Find a member</h2>
      <form id="form" class="row">
        <input id="q" class="grow" type="search" maxlength="100" placeholder="Name, email or account id (leave empty for the latest members)" aria-label="Search members">
        <button class="primary" type="submit">Search</button>
      </form>
      <p class="muted small">Shows status and counts only. Entry content is never shown here.</p>
    </section>
    <section id="msg" class="error" role="alert" hidden></section>
    <section id="results"></section>
    <section class="card">
      <h2>Recent status changes</h2>
      <div id="log" class="small"></div>
    </section>
  </main>
  <script src="/admin/app.js" defer></script>
</body>
</html>
`;

// Everything from the server is inserted as text (textContent), never as HTML.
export const ADMIN_SCRIPT = `(function () {
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function when(s) { return s ? new Date(s * 1000).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "never"; }
  function kb(n) { return n < 1024 ? n + " B" : (n / 1024).toFixed(1) + " KB"; }
  function show(t) { var m = $("msg"); m.textContent = t || ""; m.hidden = !t; }
  function call(path, body) {
    var opts = { credentials: "same-origin" };
    if (body) { opts.method = "POST"; opts.headers = { "content-type": "application/json" }; opts.body = JSON.stringify(body); }
    return fetch(path, opts).then(function (r) { return r.json().catch(function () { return { ok: false }; }); });
  }

  function card(m) {
    var c = el("div", "card");
    var top = el("div", "row");
    var who = el("div", "grow");
    who.append(el("strong", null, m.name || "(no name yet)"));
    who.append(el("div", "muted small", m.email || "(no email yet: shown after the member's next sign-in)"));
    top.append(who);
    var badge = el("span", m.status === "active" ? "muted" : "error", m.status.toUpperCase());
    top.append(badge);
    c.append(top);
    var id = el("div", "muted small", "Account id: " + m.id); id.setAttribute("dir", "ltr");
    c.append(id);
    c.append(el("div", "small", "First sign-in: " + when(m.created_at) + "   Last sign-in: " + when(m.last_login)));
    c.append(el("div", "small", m.contexts + " contexts, " + m.entries + " entries, " + kb(m.bytes)));
    var b = el("button", m.status === "active" ? "danger" : "primary", m.status === "active" ? "Suspend" : "Activate");
    b.type = "button";
    if (m.self) { b.disabled = true; b.textContent = "This is you"; }
    b.addEventListener("click", function () {
      var next = m.status === "active" ? "suspended" : "active";
      if (!window.confirm((next === "suspended" ? "Suspend " : "Activate ") + (m.email || m.name || m.id) + "?")) return;
      b.disabled = true;
      call("/admin/api/status", { member: m.id, status: next }).then(function (d) {
        show(d && d.ok ? "" : "Could not change the status (" + ((d && d.error) || "error") + ").");
        search(); loadLog();
      });
    });
    var actions = el("div", "row"); actions.style.marginTop = "8px"; actions.append(b);
    c.append(actions);
    return c;
  }

  function search() {
    return call("/admin/api/search?q=" + encodeURIComponent($("q").value.trim())).then(function (d) {
      var r = $("results"); r.replaceChildren();
      if (!d || !d.ok) return show("Search failed.");
      if (!d.members.length) r.append(el("p", "muted", "No member found."));
      d.members.forEach(function (m) { r.append(card(m)); });
    });
  }

  function loadLog() {
    return call("/admin/api/log").then(function (d) {
      var l = $("log"); l.replaceChildren();
      if (!d || !d.ok || !d.log.length) return l.append(el("span", "muted", "No changes yet."));
      d.log.forEach(function (x) {
        l.append(el("div", null, when(x.at) + "  " + (x.email || x.name || x.member_id) + ": " + x.old_status + " to " + x.new_status));
      });
    });
  }

  $("form").addEventListener("submit", function (e) { e.preventDefault(); show(""); search(); });
  search(); loadLog();
})();
`;
