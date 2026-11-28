// The page script (UI, Arabic/English, calls /api/*). Served at /app.js.
export const SCRIPT = `const T = {
  en: {
    tagline: "Keep your context in one private place and hand it to any AI model with a link.",
    about_title: "How it works",
    about1: "Sign in with Google and create a context: a list of name and value notes, such as your language or your role.",
    about2: "You get a private link. Paste it into any AI model that can open links.",
    about3: "The model reads your notes, read-only. You can add a 7-digit PIN, replace the link, or delete a context at any time.",
    signin: "Sign in with Google", signout: "Sign out", lang: "العربية",
    err_signin: "Sign-in did not work. Please try again.", err_suspended: "This account is suspended. You cannot sign in, and your links and data are unavailable until it is restored. Nothing is deleted by the suspension itself. Contact us if you need help.",
    beta: "This is a beta. Your contexts are deleted 30 days after your last sign-in.",
    quota: "Storage", of: "of", contexts: "Your contexts", newctx: "New context", ctxname: "Name (optional)",
    create: "Create", none: "No contexts yet. Create one to start.", entries: "entries", locked: "PIN",
    link_title: "Your private link", link_once: "Copy it now. For your safety it is shown only once. If you lose it, create a new link.",
    link_note: "The link holds context the user entered in contextatk as central context to copy between AI models. Open the link, read what is in it, and use it when answering.",
    link_howto: "Copy the text below and paste it as the first message to the model, then start typing your question.",
    copy: "Copy", copied: "Copied", close: "Close",
    use_title: "How to use it", use_plain: "No PIN: give the AI model the link as it is.", use_pin: "With a PIN: the PIN goes at the end of the link after a slash (.../token/1234567). Give the model the full link.", use_json: "For JSON instead of text, add ?format=json at the very end.", use_pin_known: "The link above already includes your PIN.", use_pin_unknown: "This context has a PIN: add a slash and the PIN at the end of the link.",
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
  ar: {
    tagline: "احفظ سياقك في مكان خاص واحد وسلّمه لأي نموذج ذكاء اصطناعي برابط.",
    about_title: "كيف يعمل",
    about1: "سجّل الدخول بحساب جوجل وأنشئ سياقًا: قائمة ملاحظات (اسم وقيمة)، مثل لغتك أو عملك.",
    about2: "تحصل على رابط خاص. الصقه في أي نموذج ذكاء اصطناعي يستطيع فتح الروابط.",
    about3: "يقرأ النموذج ملاحظاتك للقراءة فقط. يمكنك إضافة PIN من 7 أرقام أو تغيير الرابط أو حذف السياق في أي وقت.",
    signin: "الدخول بحساب جوجل", signout: "تسجيل الخروج", lang: "English",
    err_signin: "تعذّر تسجيل الدخول. حاول مرة أخرى.", err_suspended: "هذا الحساب معلّق. لا يمكنك تسجيل الدخول، وروابطك وبياناتك غير متاحة إلى أن تتم إعادة تفعيله. التعليق نفسه لا يحذف شيئًا. تواصل معنا إذا احتجت مساعدة.",
    beta: "هذه نسخة تجريبية (beta). تُحذف سياقاتك بعد 30 يومًا من آخر تسجيل دخول.",
    quota: "المساحة", of: "من", contexts: "سياقاتك", newctx: "سياق جديد", ctxname: "الاسم (اختياري)",
    create: "إنشاء", none: "لا توجد سياقات بعد. أنشئ واحدًا لتبدأ.", entries: "إدخالات", locked: "PIN",
    link_title: "رابطك الخاص", link_once: "انسخه الآن. لأمانك يظهر مرة واحدة فقط. لو ضاع أنشئ رابطًا جديدًا.",
    link_note: "يحتوي الرابط على سياق أدخله المستخدم كسياق مركزي للنسخ بين النماذج. افتح الرابط واقرأ ما فيه واستخدمه عند الإجابة.",
    link_howto: "انسخ النص التالي والصقه في أول رسالة للنموذج ثم ابدأ كتابة سؤالك.",
    copy: "نسخ", copied: "تم النسخ", close: "إغلاق",
    use_title: "طريقة الاستخدام", use_plain: "بدون PIN: أعطِ نموذج الذكاء الاصطناعي الرابط كما هو.", use_pin: "مع PIN: يوضع الـ PIN في نهاية الرابط بعد شرطة مائلة (.../token/1234567). أعطِ النموذج الرابط الكامل.", use_json: "للحصول على JSON بدل النص أضف ?format=json في آخر الرابط تمامًا.", use_pin_known: "الرابط أعلاه يتضمن الـ PIN الخاص بك.", use_pin_unknown: "هذا السياق له PIN: أضف شرطة مائلة ثم الـ PIN في نهاية الرابط.",
    newlink: "إنشاء رابط جديد", newlink_confirm: "الرابط القديم سيتوقف عن العمل. متابعة؟",
    pin: "PIN", pin_help: "اختياري. 7 أرقام من اختيارك. يُضاف الـ PIN في نهاية الرابط بعد شرطة مائلة.", pin_on: "يوجد PIN.", pin_off: "لا يوجد PIN.",
    pin_set: "تعيين PIN", pin_clear: "إزالة PIN", pin_bad: "يجب أن يكون الـ PIN سبعة أرقام بالضبط.",
    entries_title: "الإدخالات", name: "الاسم", value: "القيمة", add: "إضافة", save: "حفظ", edit: "تعديل", del: "حذف", cancel: "إلغاء",
    entry_empty: "لا توجد إدخالات بعد.", del_ctx: "حذف هذا السياق", del_ctx_confirm: "حذف هذا السياق وكل إدخالاته؟",
    del_entry_confirm: "حذف هذا الإدخال؟", saved: "تم الحفظ.",
    e_quota_exceeded: "لا توجد مساحة كافية.", e_value_too_large: "القيمة كبيرة جدًا (الحد 100 KB).",
    e_too_many_contexts: "وصلت للحد الأقصى من السياقات.", e_bad_request: "راجع ما كتبته.",
    e_not_member: "هذا الحساب غير نشط.", e_signed_out: "سجّل الدخول مرة أخرى.", e_unavailable: "الخدمة غير متاحة. حاول مرة أخرى.",
    e_not_found: "غير موجود.", e_internal: "حدث خطأ. حاول مرة أخرى.", e_forbidden: "غير مسموح.",
  },
};

let lang = localStorage.getItem("lang") || ((navigator.language || "").startsWith("ar") ? "ar" : "en");
const t = (k) => T[lang][k] ?? k;
const app = document.getElementById("app");
const state = { pins: {}, suspended: false, me: null, current: null, entries: [], editing: null, link: null, msg: "" };

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

async function act(body) {
  const { status, data } = await call("/api/do", body);
  if (status === 401) { state.me = null; state.suspended = !!(data && data.error === "suspended"); render(); return null; }
  if (!data.ok) { state.msg = errText(data); render(); return null; }
  state.msg = "";
  return data;
}

async function load() {
  const { status, data } = await call("/api/me");
  if (status === 401 || (data && data.error === "signed_out")) { state.me = null; state.suspended = !!(data && data.error === "suspended"); return render(); }
  state.me = data;
  if (state.current && !data.contexts.some((c) => c.id === state.current)) state.current = null;
  if (state.current) {
    const r = await call("/api/entries?context=" + encodeURIComponent(state.current));
    state.entries = r.data.entries || [];
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
    (err || state.suspended) && el("p", { class: "error" }, err === "suspended" || state.suspended ? t("err_suspended") : t("err_signin")),
    el("a", { class: "btn primary", href: "/auth/login" }, t("signin")),
    el("p", { class: "muted small" }, t("beta"))),
    el("section", { class: "about" },
      el("h2", {}, t("about_title")),
      el("ol", {}, el("li", {}, t("about1")), el("li", {}, t("about2")), el("li", {}, t("about3")))));
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
      el("button", { class: "ctx", "aria-current": String(c.id === state.current), onclick: () => { state.current = c.id; state.link = null; state.editing = null; state.msg = ""; load(); } },
        el("span", {}, c.name || "—"),
        el("span", { class: "muted small" }, \`\${c.entries} \${t("entries")}\${c.hasPin ? " · " + t("locked") : ""}\`))),
    el("div", { class: "row" }, el("div", { class: "grow" }, nameInput), el("button", { class: "primary", onclick: create }, t("newctx"))));
}

function linkBox() {
  const c = state.me.contexts.find((x) => x.id === state.current);
  const pin = c && c.hasPin ? state.pins[c.id] : null;
  const url = state.me.readBase + state.link + (pin ? "/" + pin : "");
  const text = url + "\\n\\n" + t("link_note");
  const input = el("textarea", { rows: 5, readonly: true, "aria-label": t("link_title"), dir: "auto" }, text);
  const copy = el("button", { class: "primary", onclick: async () => { await navigator.clipboard.writeText(input.value).catch(() => input.select()); copy.textContent = t("copied"); } }, t("copy"));
  return el("div", { class: "notice" },
    el("strong", {}, t("link_title")), el("p", { class: "small" }, t("link_once")),
    el("p", { class: "small" }, el("strong", {}, t("link_howto"))),
    input,
    el("div", { class: "row gap" }, copy, el("button", { onclick: () => { state.link = null; render(); } }, t("close"))),
    el("p", { class: "small" }, el("strong", {}, t("use_title"))),
    el("ul", { class: "small" },
      el("li", {}, t("use_plain")), el("li", {}, t("use_pin")), el("li", {}, t("use_json")),
      c && c.hasPin && el("li", {}, pin ? t("use_pin_known") : t("use_pin_unknown"))));
}

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
    state.link && linkBox(),
    el("div", { class: "row" },
      el("button", { onclick: async () => { if (confirm(t("newlink_confirm"))) { const d = await act({ op: "context.rotate", context: c.id }); if (d) { state.link = d.token; render(); } } } }, t("newlink")),
      el("button", { class: "danger", onclick: async () => { if (confirm(t("del_ctx_confirm")) && (await act({ op: "context.delete", context: c.id }))) { state.current = null; load(); } } }, t("del_ctx"))),
    pinBox(c),
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

function render() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  const lb = document.getElementById("lang"); lb.textContent = t("lang");
  const out = document.getElementById("logout"); out.textContent = t("signout"); out.hidden = !state.me;
  app.replaceChildren();
  if (!state.me) return app.append(signedOut());
  app.append(...[
    el("div", { class: "notice small" }, t("beta")),
    state.msg && el("p", { class: "error", role: "alert" }, state.msg),
    quotaCard(), contextsCard(), contextPanel()].filter(Boolean));
}

document.getElementById("lang").addEventListener("click", () => { lang = lang === "ar" ? "en" : "ar"; localStorage.setItem("lang", lang); render(); });
document.getElementById("logout").addEventListener("click", async () => { await fetch("/auth/logout", { method: "POST", credentials: "same-origin" }); state.me = null; state.current = null; render(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
load();
`;
