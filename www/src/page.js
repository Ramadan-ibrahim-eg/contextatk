import { PIN_UI } from "./config.js";

// The page (HTML). Served at /. No inline script or style: the CSP forbids them.
//
// Two bodies: the landing content for a visitor with no session (also what search engines and
// AI tools read), and a short app shell for a member who is signed in. The member must never
// see "Sign in with Google" while the page is still loading: that flash looked like a session
// that had dropped, and it is also what a reader without JavaScript sees.
const LANDING = `
    <section class="hero">
      <img src="/logo.jpg" alt="" width="96" height="96">
      <h1>contextatk</h1>
      <p class="muted">Keep your context in one private place and hand it to any AI model with a link.</p>
      <a class="btn primary" href="/auth/login">Sign in with Google</a>
      <p class="muted small">This is a beta. Your contexts are deleted 30 days after your last sign-in.</p>
    </section>
    <section class="about">
      <h2>How it works</h2>
      <ol>
        <li>Sign in with Google and create a context: a list of name and value notes, such as your language or your role.</li>
        <li>You get a private link. Paste it into any AI model that can open links.</li>
        <li>The model reads your notes, read-only. You can ${PIN_UI ? "add a 7-digit PIN, " : ""}replace the link, or delete a context at any time.</li>
      </ol>
    </section>`;

const APP = `
    <section class="hero">
      <img src="/logo.jpg" alt="" width="96" height="96">
      <h1>contextatk</h1>
      <p class="muted"><span class="en">Loading your contexts…</span><span class="ar">جارٍ تحميل سياقاتك…</span></p>
    </section>`;

export const PAGE = (app) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>contextatk (beta): your context, one link for any AI model</title>
  <meta name="description" content="Keep your context in one private place and hand it to any AI model with a link. Read-only${PIN_UI ? ", optional 7-digit PIN" : ""}, sign in with Google. Beta.">
  <link rel="canonical" href="{{SITE}}/">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#1f6feb">
  <meta name="color-scheme" content="light dark">
  {{VERIFY}}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="contextatk">
  <meta property="og:title" content="contextatk (beta)">
  <meta property="og:description" content="Keep your context in one private place and hand it to any AI model with a link.">
  <meta property="og:url" content="{{SITE}}/">
  <meta property="og:image" content="{{SITE}}/icon-512.png">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="ar_AR">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="contextatk (beta)">
  <meta name="twitter:description" content="Keep your context in one private place and hand it to any AI model with a link.">
  <meta name="twitter:image" content="{{SITE}}/icon-512.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt">
  <link rel="stylesheet" href="/app.css">
  <script src="/theme.js"></script>
</head>
<body>
  <header>
    <a class="brand" href="/"><img src="/logo.jpg" alt="" width="32" height="32"><span>contextatk <small>beta</small></span></a>
    <nav><button id="theme" class="link" type="button" aria-label="Dark mode / الوضع الليلي" title="Dark mode / الوضع الليلي"></button><button id="lang" class="link" type="button"></button><button id="logout" class="link" type="button" hidden></button></nav>
  </header>
  <main id="app" aria-live="polite">${app ? APP : LANDING}
  </main>
  {{FOOTER}}
  <script src="/common.js" defer></script>
  <script src="/app.js" type="module"></script>
</body>
</html>
`;
