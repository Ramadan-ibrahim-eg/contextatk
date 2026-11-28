// The styles. Served at /app.css.
const DARK = "--bg:#0f1318; --card:#181d24; --text:#e8ebef; --muted:#a8b2be; --line:#2d353f; --brand:#1f6feb; --link:#7ab2ff; --bad:#ff8f86; --ok:#6fcf8e; --field:#10151b; --note-bg:#3a3217; --note-line:#6b5a1f; --shadow:#00000066; color-scheme:dark;";

export const STYLE = `:root { --link:#1f6feb; --field:#fff; --note-bg:#fff8e1; --note-line:#f0d98a; --shadow:#0000001a; color-scheme:light; --bg:#f6f7f9; --card:#fff; --text:#1c2026; --muted:#5d6672; --line:#dfe3e8; --brand:#1f6feb; --bad:#c62828; --ok:#1b7f3b; }
@media (prefers-color-scheme: dark) { html:not([data-theme="light"]) { ${DARK} } }
html[data-theme="dark"] { ${DARK} }
* { box-sizing: border-box; }
body { margin:0; font:16px/1.5 system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif; background:var(--bg); color:var(--text); }
header { display:flex; justify-content:space-between; align-items:center; padding:12px 20px; background:var(--card); border-bottom:1px solid var(--line); }
.brand { display:flex; align-items:center; gap:10px; color:inherit; text-decoration:none; font-weight:700; }
.brand small { font-weight:400; color:var(--muted); border:1px solid var(--line); border-radius:6px; padding:0 6px; }
nav { display:flex; gap:14px; }
main { max-width:860px; margin:24px auto; padding:0 16px; }
h1 { font-size:1.5rem; margin:0 0 8px; } h2 { font-size:1.15rem; margin:0 0 8px; }
.card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px; margin-bottom:16px; }
.muted { color:var(--muted); } .small { font-size:.9rem; }
.row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.grow { flex:1; }
button, .btn { font:inherit; cursor:pointer; border:1px solid var(--line); background:var(--card); color:var(--text); padding:7px 14px; border-radius:8px; text-decoration:none; display:inline-block; }
button.primary, .btn.primary { background:var(--brand); border-color:var(--brand); color:#fff; }
button.danger { color:var(--bad); border-color:var(--bad); }
[hidden] { display:none !important; }
button.link { border:0; background:none; color:var(--link); padding:0; }
button:disabled { opacity:.5; cursor:default; }
input, textarea { font:inherit; width:100%; padding:8px 10px; border:1px solid var(--line); border-radius:8px; background:var(--field); color:var(--text); }
textarea { min-height:90px; resize:vertical; font-family: ui-monospace, Menlo, Consolas, monospace; font-size:.92rem; }
label { display:block; font-weight:600; margin:10px 0 4px; }
.bar { height:10px; background:var(--line); border-radius:6px; overflow:hidden; }
.bar > div { height:100%; background:var(--brand); }
.ctx { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 12px; border:1px solid var(--line); border-radius:10px; margin-bottom:8px; cursor:pointer; background:var(--field); width:100%; text-align:start; }
.ctx[aria-current="true"] { border-color:var(--brand); box-shadow:0 0 0 2px #1f6feb55; }
.entry { border-top:1px solid var(--line); padding:12px 0; }
.entry pre { margin:6px 0; white-space:pre-wrap; word-break:break-word; font-family: ui-monospace, Menlo, Consolas, monospace; font-size:.9rem; max-height:160px; overflow:auto; background:var(--bg); padding:8px; border-radius:8px; }
.notice { padding:10px 12px; border-radius:8px; background:var(--note-bg); border:1px solid var(--note-line); margin-bottom:12px; }
.error { color:var(--bad); } .good { color:var(--ok); }
.hero { text-align:center; padding:48px 16px; }
.hero p { max-width:520px; margin:8px auto 20px; }
.about { max-width:520px; margin:0 auto 32px; padding:0 16px; }
.about ol { padding-inline-start:20px; margin:8px 0; }
.about li { margin-bottom:8px; }
a { color:var(--link); }
header a.brand { color:inherit; }
.btn.primary { color:#fff; }
#theme { font-size:1.1rem; line-height:1; }
.gap { margin-top:18px; }
.guide h3 { margin:18px 0 6px; font-size:1rem; }
.guide ul { padding-inline-start:20px; margin:6px 0; }
.guide li { margin-bottom:6px; }

/* footer and information pages */
.site-footer { max-width:860px; margin:32px auto 80px; padding:16px; border-top:1px solid var(--line); }
.site-footer nav { display:flex; flex-wrap:wrap; gap:8px 20px; justify-content:center; }
.site-footer a { color:var(--muted); text-decoration:none; font-size:.9rem; }
.site-footer a:hover { text-decoration:underline; }
.doc { max-width:760px; }
.doc article { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:20px 24px; }
.doc h1 { margin-bottom:4px; } .doc h2 { margin-top:22px; }
.doc a { color:var(--link); }
.doc ul, .doc ol { padding-inline-start:22px; }
.doc li { margin-bottom:6px; }
.doc table { width:100%; border-collapse:collapse; font-size:.95rem; }
.doc th, .doc td { text-align:start; vertical-align:top; padding:8px; border-bottom:1px solid var(--line); }
/* cookie notice */
.notice-bar { position:fixed; inset-inline:0; bottom:0; display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; padding:12px 20px; background:var(--card); border-top:1px solid var(--line); box-shadow:0 -2px 8px var(--shadow); z-index:10; }
.notice-bar p { margin:0; flex:1; min-width:240px; font-size:.92rem; }
.notice-bar a { color:var(--link); }
`;
