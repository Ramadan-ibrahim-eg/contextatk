import { PIN_UI } from "./config.js";

// The page script (UI, English only, calls /api/*). Served at /app.js.
export const SCRIPT = `const T = {
  en: {
    tagline: "Keep your context in one private place and hand it to any AI model with a link.",
    about_title: "How it works",
    about1: "Sign in with Google and create a context: a list of name and value notes, such as your language or your role.",
    about2: "You get a private link. Paste it into any AI model that can open links.",
    about3: "The model reads your notes, read-only. You can add a 7-digit PIN, replace the link, or delete a context at any time.",
    about3_nopin: "The model reads your notes, read-only. You can replace the link or delete a context at any time.", use_plain_nopin: "Give the AI model the link as it is.",
    signin: "Sign in with Google", signout: "Sign out",
    err_signin: "Sign-in did not work. Please try again.", err_suspended: "This account is suspended. You cannot sign in, and your links and data are unavailable until it is restored. Nothing is deleted by the suspension itself. Contact us if you need help.",
    beta: "This is a beta. Your contexts are deleted 30 days after your last sign-in.",
    quota: "Storage", of: "of", contexts: "Your contexts", newctx: "New context", ctxname: "Name (optional)",
    create: "Create", none: "No contexts yet. Create one to start.", entries: "entries", locked: "PIN",
    link_title: "Your private link", link_once: "You can copy this link from here at any time.",
    link_legacy: "This link was made before links could be shown again, so it cannot be displayed. Create a new link to get one you can copy here at any time. The old link stops working.",
    style_label: "Text style", format_label: "Output format",
    style_standard: "Standard", style_about: "About me", style_preferences: "Preferences", style_work: "Current work", style_link: "Link only",
    note_standard: "This is my context from contextatk. It stays with me from one conversation to the next. Please open the link, read it, and use it when you answer me.",
    note_about: "My context from contextatk describes who I am and how I work. Please open the link, read it, and use it in your answers.",
    note_preferences: "This link holds my preferences for how I like answers written. They are part of my context and stay the same between conversations. Please read them and use them in your answers.",
    note_work: "This link holds my context for what I am working on. Please read it before you start and use it throughout our conversation.",
    note_link: "",
    fmt_txt: "txt (default)", fmt_md: "md", fmt_yaml: "yaml", fmt_json: "json",
    use_format: "The format is the last part of the copied link (?format=txt, md, yaml or json). Change it in the box above, or edit the end of the link.",    link_howto: "Copy the text below and paste it as the first message to the model, then start typing your question.",
    copy: "Copy", copied: "Copied", close: "Close",
    use_title: "How to use it", use_plain: "No PIN: give the AI model the link as it is.", use_pin: "With a PIN: the PIN goes at the end of the link after a slash (.../token/1234567). Give the model the full link.", use_pin_known: "The link above already includes your PIN.", use_pin_unknown: "This context has a PIN: add a slash and the PIN at the end of the link.",
    duplicate: "Duplicate this context", duplicated: "Copied. This is a separate context with its own link; changes to either one do not affect the other.",
    newlink: "Create a new link", newlink_confirm: "The old link will stop working. Continue?",
    pin: "PIN", pin_help: "Optional. 7 digits you choose. The PIN is added at the end of the link, after a slash.", pin_on: "A PIN is set.", pin_off: "No PIN.",
    pin_set: "Set PIN", pin_clear: "Remove PIN", pin_bad: "The PIN must be exactly 7 digits.",
    entries_title: "Entries", name: "Name", value: "Value", add: "Add", save: "Save", edit: "Edit", del: "Delete", cancel: "Cancel",
    entry_empty: "No entries yet.", del_ctx: "Delete this context", del_ctx_confirm: "Delete this context and all its entries?",
    del_entry_confirm: "Delete this entry?", saved: "Saved.",
    e_quota_exceeded: "Not enough storage left.", e_value_too_large: "The value is too large (max 100 KB).",
    e_too_many_contexts: "You reached the maximum number of contexts.", e_bad_request: "Please check what you typed.",
    e_not_member: "This account is not active.", e_signed_out: "Please sign in again.", e_unavailable: "Service unavailable. Try again.",
    e_not_found: "Not found.", e_internal: "Something went wrong. Try again.", e_forbidden: "Not allowed.",
  },
};

const t = (k) => T.en[k] ?? k;
const PIN_UI = ${PIN_UI}; // the PIN box is hidden while this is false (see config.js); its code below is kept
const app = document.getElementById("app");
const state = { pins: {}, suspended: false, me: null, current: null, entries: [], editing: null, link: null, linkLegacy: false, msg: "", style: "standard", format: "txt" };

function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, "");
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
}

async function call(path, body) {
  const opts = body
    ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
    : {};
  const r = await fetch(path, { credentials: "same-origin", ...opts });
  const data = await r.json().catch(() => ({ ok: false, error: "internal" }));
  return { status: r.status, data };
}
const errText = (data) => t("e_" + (data && data.error)) !== "e_" + (data && data.error) ? t("e_" + data.error) : t("e_internal");

// A 401 on its own does not prove the session ended (a server problem can answer 401 too),
// so ask /api/me: only its answer sends the user back to the sign-in page.
async function sessionGone(data) {
  const r = await call("/api/me");
  if (r.status === 200 && r.data && Array.isArray(r.data.contexts)) { state.me = r.data; return false; }
  state.me = null;
  state.suspended = !!((r.data && r.data.error === "suspended") || (data && data.error === "suspended"));
  render();
  return true;
}

async function act(body) {
  const { status, data } = await call("/api/do", body);
  if (status === 401) {
    if (await sessionGone(data)) return null;
    state.msg = t("e_unavailable"); render(); return null;
  }
  if (!data || !data.ok) { state.msg = errText(data); render(); return null; }
  state.msg = "";
  return data;
}

async function load() {
  const good = (d) => !!d && Array.isArray(d.contexts);
  let r = await call("/api/me");
  // One retry before believing a failure: a hiccup must not look like a sign-out.
  if (!good(r.data) && !(r.data && (r.data.error === "signed_out" || r.data.error === "suspended"))) {
    await new Promise((ok) => setTimeout(ok, 1200));
    r = await call("/api/me");
  }
  const data = r.data;
  if (r.status === 401 || (data && (data.error === "signed_out" || data.error === "suspended"))) {
    state.me = null; state.suspended = !!(data && data.error === "suspended"); return render();
  }
  if (!good(data)) { state.msg = t("e_unavailable"); return render(); }
  state.me = data;
  if (state.current && !data.contexts.some((c) => c.id === state.current)) state.current = null;
  if (state.current) {
    const r2 = await call("/api/entries?context=" + encodeURIComponent(state.current));
    state.entries = r2.data.entries || [];
    // The link is fetched every time a context is opened, so it is always at hand.
    const l = await call("/api/do", { op: "context.link", context: state.current });
    state.link = l.data && l.data.ok && l.data.token ? l.data.token : null;
    state.linkLegacy = !!(l.data && l.data.legacy);
  }
  render();
}

const fmt = (n) => (n < 1024 ? n + " B" : (n / 1024).toFixed(n < 10240 ? 1 : 0) + " KB");

function signedOut() {
  const err = new URLSearchParams(location.search).get("error");
  return el("div", {},
    el("section", { class: "hero" },
    el("img", { src: "/logo.jpg", alt: "", width: 96, height: 96 }),
    el("h1", {}, "contextatk"),
    el("p", { class: "muted" }, t("tagline")),
    (err || state.suspended || state.msg) && el("p", { class: "error" }, err === "suspended" || state.suspended ? t("err_suspended") : (state.msg || t("err_signin"))),
    el("a", { class: "btn primary", href: "/auth/login" }, t("signin")),
    el("p", { class: "muted small" }, t("beta"))),
    el("section", { class: "about" },
      el("h2", {}, t("about_title")),
      el("ol", {}, el("li", {}, t("about1")), el("li", {}, t("about2")), el("li", {}, t(PIN_UI ? "about3" : "about3_nopin")))));
}

function quotaCard() {
  const q = state.me.quota;
  const fill = el("div"); fill.style.width = Math.min(100, (q.used / q.max) * 100) + "%"; // CSSOM, allowed by the CSP
  return el("div", { class: "card" },
    el("div", { class: "row" }, el("strong", { class: "grow" }, t("quota")), el("span", { class: "muted" }, el("bdi", {}, fmt(q.used)), \` \${t("of")} \`, el("bdi", {}, fmt(q.max)))),
    el("div", { class: "bar", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": q.max, "aria-valuenow": q.used }, fill));
}

function contextsCard() {
  const nameInput = el("input", { maxlength: 100, placeholder: t("ctxname"), "aria-label": t("ctxname") });
  const create = async () => {
    const d = await act({ op: "context.create", name: nameInput.value.trim() });
    if (d) { state.current = d.context; state.link = d.token; state.editing = null; await load(); }
  };
  return el("div", { class: "card" },
    el("h2", {}, t("contexts")),
    state.me.contexts.length === 0 && el("p", { class: "muted" }, t("none")),
    state.me.contexts.map((c) =>
      el("button", { class: "ctx", "aria-current": String(c.id === state.current), onclick: () => { state.current = c.id; state.link = null; state.linkLegacy = false; state.editing = null; state.msg = ""; load(); } },
        el("span", {}, c.name || "—"),
        el("span", { class: "muted small" }, \`\${c.entries} \${t("entries")}\${PIN_UI && c.hasPin ? " · " + t("locked") : ""}\`))),
    el("div", { class: "row" }, el("div", { class: "grow" }, nameInput), el("button", { class: "primary", onclick: create }, t("newctx"))));
}

function linkBox() {
  const c = state.me.contexts.find((x) => x.id === state.current);
  const pin = PIN_UI && c && c.hasPin ? state.pins[c.id] : null;
  // A context from before links could be re-shown has no token to rebuild: say so plainly.
  if (!state.link) return el("div", { class: "notice" }, el("strong", {}, t("link_title")), el("p", { class: "small" }, t("link_legacy")));
  const url = state.me.readBase + state.link + (pin ? "/" + pin : "");
  const STYLES = ["standard", "about", "preferences", "work", "link"];
  const FORMATS = ["txt", "md", "yaml", "json"];
  // The copied text: the link ending in the chosen output format, then the chosen style of text.
  const build = () => url + "?format=" + state.format + (state.style === "link" ? "" : "\\n\\n" + t("note_" + state.style));
  const input = el("textarea", { rows: 5, readonly: true, "aria-label": t("link_title"), dir: "auto" }, build());
  const pick = (id, label, key, values, prefix) => {
    const sel = el("select", { id, "aria-label": t(label) }, values.map((v) => el("option", { value: v, selected: v === state[key] }, t(prefix + v))));
    sel.addEventListener("change", () => { state[key] = sel.value; input.value = build(); });
    return el("label", { class: "small", for: id }, t(label) + " ", sel);
  };
  const copy = el("button", { class: "primary", onclick: async () => { await navigator.clipboard.writeText(input.value).catch(() => input.select()); copy.textContent = t("copied"); } }, t("copy"));
  return el("div", { class: "notice" },
    el("strong", {}, t("link_title")), el("p", { class: "small" }, t("link_once")),
    el("p", { class: "small" }, el("strong", {}, t("link_howto"))),
    el("div", { class: "row gap" }, pick("fmt", "format_label", "format", FORMATS, "fmt_"), pick("sty", "style_label", "style", STYLES, "style_")),
    input,
    el("div", { class: "row gap" }, copy),
    el("p", { class: "small" }, el("strong", {}, t("use_title"))),
    el("ul", { class: "small" },
      el("li", {}, t(PIN_UI ? "use_plain" : "use_plain_nopin")), PIN_UI && el("li", {}, t("use_pin")), el("li", {}, t("use_format")),
      PIN_UI && c && c.hasPin && el("li", {}, pin ? t("use_pin_known") : t("use_pin_unknown"))));
}

// Hidden while PIN_UI is false (28 Nov 2026). Code kept so the feature can be turned back on.
function pinBox(c) {
  const pin = el("input", { inputmode: "numeric", maxlength: 7, pattern: "[0-9]{7}", placeholder: "0000000", dir: "ltr", "aria-label": t("pin") });
  return el("div", {},
    el("h2", {}, t("pin")), el("p", { class: "muted small" }, t("pin_help")),
    el("p", {}, c.hasPin ? t("pin_on") : t("pin_off")),
    el("div", { class: "row" },
      el("div", { class: "grow" }, pin),
      el("button", { onclick: async () => {
        if (!/^\\d{7}$/.test(pin.value)) { state.msg = t("pin_bad"); return render(); }
        if (await act({ op: "context.pin", context: c.id, pin: pin.value })) { state.pins[c.id] = pin.value; load(); }
      } }, t("pin_set")),
      c.hasPin && el("button", { onclick: async () => { if (await act({ op: "context.pin", context: c.id, pin: null })) { delete state.pins[c.id]; load(); } } }, t("pin_clear"))));
}

function entryRow(c, e) {
  if (state.editing === e.name) {
    const v = el("textarea", { dir: "auto" }, e.value);
    return el("div", { class: "entry" }, el("strong", {}, e.name), v,
      el("div", { class: "row" },
        el("button", { class: "primary", onclick: async () => { if (await act({ op: "entry.set", context: c.id, name: e.name, value: v.value })) { state.editing = null; load(); } } }, t("save")),
        el("button", { onclick: () => { state.editing = null; render(); } }, t("cancel"))));
  }
  return el("div", { class: "entry" },
    el("div", { class: "row" }, el("strong", { class: "grow" }, e.name), el("span", { class: "muted small" }, fmt(e.size))),
    el("pre", { dir: "auto" }, e.value),
    el("div", { class: "row" },
      el("button", { onclick: () => { state.editing = e.name; render(); } }, t("edit")),
      el("button", { class: "danger", onclick: async () => { if (confirm(t("del_entry_confirm")) && (await act({ op: "entry.delete", context: c.id, name: e.name }))) load(); } }, t("del"))));
}

function contextPanel() {
  const c = state.me.contexts.find((x) => x.id === state.current);
  if (!c) return null;
  const n = el("input", { maxlength: 128, "aria-label": t("name") });
  const v = el("textarea", { "aria-label": t("value"), dir: "auto" });
  return el("div", { class: "card" },
    el("h1", {}, c.name || "—"),
    (state.link || state.linkLegacy) && linkBox(),
    el("div", { class: "row" },
      el("button", { onclick: async () => { if (confirm(t("newlink_confirm"))) { const d = await act({ op: "context.rotate", context: c.id }); if (d) { state.link = d.token; render(); } } } }, t("newlink")),
      el("button", { onclick: async () => { const d = await act({ op: "context.duplicate", context: c.id }); if (d) { state.current = d.context; state.link = d.token; state.editing = null; await load(); state.msg = ""; render(); } } }, t("duplicate")),
      el("button", { class: "danger", onclick: async () => { if (confirm(t("del_ctx_confirm")) && (await act({ op: "context.delete", context: c.id }))) { state.current = null; load(); } } }, t("del_ctx"))),
    PIN_UI && pinBox(c),
    el("h2", { class: "gap" }, t("entries_title")),
    state.entries.length === 0 && el("p", { class: "muted" }, t("entry_empty")),
    state.entries.map((e) => entryRow(c, e)),
    el("div", { class: "entry" },
      el("label", {}, t("name")), n, el("label", {}, t("value")), v,
      el("p", {}, el("button", { class: "primary", onclick: async () => {
        if (!n.value.trim()) return;
        if (await act({ op: "entry.set", context: c.id, name: n.value.trim(), value: v.value })) load();
      } }, t("add")))));
}

// One card at the bottom of the page: every step, what happens at each one, and how to use name/value notes well.
function guideCard() {
  const sec = (title, ...items) => [el("h3", {}, title), el("ul", { class: "small" }, items.map((x) => el("li", {}, x)))];
  return el("div", { class: "card guide" },
    el("h2", {}, "How to use contextatk"),
    el("p", { class: "muted small" }, "A short guide to every step, and to getting the most out of name and value notes."),
    ...sec("1. What this is",
      "A context is a list of notes. Each note has a name (a key) and a value. You keep them here once, and give an AI model a link so it can read them.",
      "The link is read-only. A model that opens it sees your notes as plain text. It cannot change, add or delete anything.",
      "Nothing is guaranteed about what a model does with the link. Some models can open links and some cannot. If one cannot, copy the notes into the chat yourself."),
    ...sec("2. Step by step",
      "Create a context with New context. Give it a name you will recognise, such as Work or Personal.",
      "Add notes with Name and Value, then Add. You can Edit or Delete any note later. Changes are saved at once.",
      "Copy the text from the box under Your private link. Paste it as the first message to the model, then ask your question.",
      "If you update a note, the link stays the same. The model reads the current notes each time it opens the link, so you do not paste a new link."),
    ...sec("3. Writing good notes",
      "One topic per note. A note called Writing style is better than one big note that holds everything.",
      "Short, clear names that say what the value is: Role, Language, Project, Tone, Do not use. Names can be up to 128 bytes.",
      "Short, direct values. Write what you want the model to know, in plain sentences. Lists are fine.",
      "Keep each value small: the limit is 100 KB for one value and 500 KB for all your contexts together. Notes are text only, no files.",
      "Do not store passwords, card numbers, ID numbers or anything you would not paste into a chat. Anyone who has the link can read the notes."),
    ...sec("4. Output format and text style",
      "Output format changes how the model receives the notes. txt is plain lines and the default. md is Markdown with a heading per note. yaml and json are structured and suit tools or code. The format is the last part of the copied link.",
      "Text style is the short message placed under the link. Standard fits most chats. About me is for who you are and how you work. Preferences is for how you like answers written. Current work is for the task in hand. Link only sends just the link.",
      "You can edit the copied text before you paste it. Nothing else depends on the style you pick."),
    ...sec("5. Contexts, links and copies",
      "Create a new link replaces the link of that context. The old link stops working at once, and the notes stay as they are. Use it if a link was shared by mistake.",
      "Duplicate this context makes a separate copy with the same notes and its own new link. Changing one does not change the other. The copy counts toward your 500 KB, and you can have up to 10 contexts. If there is not enough space, the copy is not made.",
      "Delete this context removes the context and all its notes, and its link stops working.",
      "Your contexts are deleted 30 days after your last sign-in. This is a beta, so keep your own copy of anything important."));
}

function render() {
    const out = document.getElementById("logout"); out.textContent = t("signout"); out.hidden = !state.me;
  app.replaceChildren();
  if (!state.me) return app.append(signedOut());
  app.append(...[
    el("div", { class: "notice small" }, t("beta")),
    state.msg && el("p", { class: "error", role: "alert" }, state.msg),
    quotaCard(), contextsCard(), contextPanel(), guideCard()].filter(Boolean));
}

document.getElementById("logout").addEventListener("click", async () => { await fetch("/auth/logout", { method: "POST", credentials: "same-origin" }); state.me = null; state.current = null; render(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
load();
`;
