// Information pages: About, Privacy Policy, Terms of Use, Cookie Policy. English only. Served at /about, /privacy, /terms, /cookies.
// The text describes what the code really does. If the code changes, update the text.

import { PIN_UI } from "./config.js";

const UPDATED = { en: "Last updated: 26 November 2026" };

// Footer on every view (landing page, app and these pages).
export const FOOTER = `<footer class="site-footer">
    <nav aria-label="Site">
      <a href="/about">About</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Use</a>
      <a href="/cookies">Cookie Policy</a>
    </nav>
  </footer>`;

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const REPO_RE = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

// Optional settings from variables: CONTACT_EMAIL and REPO_URL. When unset (or not valid) the line is left out.
function extras(env) {
  const mail = env.CONTACT_EMAIL && EMAIL_RE.test(env.CONTACT_EMAIL) ? env.CONTACT_EMAIL : "";
  const repo = env.REPO_URL && REPO_RE.test(env.REPO_URL) ? env.REPO_URL : "";
  return {
    mail,
    contact: {
      en: mail ? `<h2>Contact</h2><p><a href="mailto:${mail}">${mail}</a></p>` : "",
    },
    repo: {
      en: repo ? ` Source code: <a href="${repo}" rel="noopener">${repo}</a>.` : "",
    },
    removal: {
      en: mail ? ` To ask for the record to be removed, write to ${mail}.` : "",
    },
  };
}

const PAGES = {
  about: {
    title: "About contextatk (beta)",
    description: "What contextatk is, how it works and its limits. Beta.",
    en: (x) => `<h1>About contextatk</h1>
<p>contextatk (beta) is a place to keep your own context: short notes made of a name and a value, such as your language, your role or how you like answers written. You create a context, get a private link, and give that link to an AI model that can open links. The model reads your notes (read-only) and can use them to personalize its answers.</p>
<h2>How it works</h2>
<ol>
<li>Sign in with Google.</li>
<li>Create a context and add your entries.</li>
<li>Copy the private link. It is shown once.</li>
<li>Paste the link into an AI model.${PIN_UI ? " You can protect a context with an optional 7-digit PIN." : ""}</li>
</ol>
<h2>Limits in the beta</h2>
<ul>
<li>500 KB of storage per account, shared by all your contexts.</li>
<li>100 KB for one value, and up to 10 contexts per account.</li>
<li>Contexts are deleted 30 days after your last sign-in.</li>
</ul>
<h2>Open source</h2>
<p>The code of contextatk is open source.${x.repo.en}</p>
<p>See also the <a href="/privacy">Privacy Policy</a>, the <a href="/terms">Terms of Use</a> and the <a href="/cookies">Cookie Policy</a>.</p>
${x.contact.en}`,
  },

  privacy: {
    title: "Privacy Policy | contextatk (beta)",
    description: "What contextatk stores, who can read it, and when it is deleted.",
    en: (x) => `<h1>Privacy Policy</h1>
<p class="muted">${UPDATED.en}</p>
<p>This policy describes what contextatk (beta) stores and how it is used.</p>
<h2>What is stored</h2>
<ul>
<li><strong>Account:</strong> an identifier that Google gives us for your Google account, your email address and your name as Google provides them (refreshed at each sign-in), your account status, and the time of your first and last sign-in. We ask Google for the "openid", "email" and "profile" scopes.</li>
<li><strong>Contexts:</strong> the optional context name, the creation time, the PIN if you set one, and a hash of the link token (not the link itself).</li>
<li><strong>Entries:</strong> the names and values you write, their size and the time of the last change.</li>
<li><strong>PIN attempts:</strong> a count of wrong PIN attempts for each context and hour, kept for a short time to apply the lock.</li>
</ul>
<p>Entries are stored as plain text. They are not encrypted, and a PIN is stored as plain text too. Do not store passwords, payment card numbers or other secrets.</p>
<h2>How it is used</h2>
<p>Your email address and name are used only so the person who runs the service can find your account to give support, or to suspend or restore it. They are seen on a private admin page, not shown to other members, and not used for marketing. Everything else is used only to run the service: to show your data to you, to give it to anyone who opens your link (and enters the PIN, if one is set), to apply limits, and to delete inactive data. There are no ads, no analytics and no tracking scripts, and the data is not sold.</p>
<h2>Who can read your data</h2>
<ul>
<li>Anyone who has the link of a context, and its PIN if one is set, can read all entries of that context. If you paste a link into an AI service, that service receives the entries, and its own policies apply to what it does with them.</li>
<li>The link is shown once when you create it. Only its hash is stored, so it cannot be shown again. Creating a new link stops the old one from working.</li>
<li>The PIN has 7 digits and is optional. After 10 wrong PINs for one context within an hour, that context is locked until the next hour.</li>
<li>The person who runs the service can access the database that holds this data.</li>
</ul>
<h2>Sign-in with Google</h2>
<p>Google is the only way to sign in. Google handles your sign-in under its own privacy policy. We receive the account identifier, your email address and your name.</p>
<h2>Cookies and local storage</h2>
<p>Only essential cookies are used. See the <a href="/cookies">Cookie Policy</a>.</p>
<h2>Hosting</h2>
<p>The service runs on Cloudflare (Workers and the D1 database). Cloudflare processes requests as the hosting provider and may keep its own standard logs. The service does not write the content of your entries to logs.</p>
<h2>Retention and deletion</h2>
<ul>
<li>You can delete a context or an entry at any time. It is removed right away.</li>
<li>30 days after your last sign-in, all your contexts and entries are deleted automatically by a daily job.</li>
<li>A small membership record (account identifier, email address, name, status, first and last sign-in time) is kept after that, together with a log of status changes (account identifier, time, old and new status). There is no self-service account deletion in the beta.${x.removal.en}</li>
<li>If an account is suspended: the member cannot sign in, the links of their contexts show nothing, and the member cannot read or change their data. Nothing is deleted by the suspension itself, and restoring the account brings everything back. The 30-day deletion still counts from the last sign-in before the suspension.</li>
</ul>
<h2>Changes</h2>
<p>This policy may be updated. The date at the top shows the latest version.</p>
${x.contact.en}`,
  },

  terms: {
    title: "Terms of Use | contextatk (beta)",
    description: "The terms for using contextatk during the beta.",
    en: (x) => `<h1>Terms of Use</h1>
<p class="muted">${UPDATED.en}</p>
<p>By using contextatk you agree to these terms.</p>
<h2>Beta</h2>
<p>contextatk is a beta. It is provided as it is, without warranties. It can change, be interrupted or stop, and data can be lost. Keep your own copy of anything you need.</p>
<h2>Your account and links</h2>
<ul>
<li>You sign in with a Google account.</li>
<li>You are responsible for your links and PINs. Anyone who has a context's link, and its PIN if one is set, can read that context.</li>
</ul>
<h2>Your content</h2>
<ul>
<li>You are responsible for what you store. Store only what you have the right to store.</li>
<li>Entries are not encrypted. Do not store passwords, payment card numbers, identity numbers or other secrets.</li>
<li>Do not misuse the service: no attacks, no excessive requests, and no attempts to guess links or PINs.</li>
</ul>
<h2>Limits and deletion</h2>
<p>The limits are: 500 KB of storage per account, 100 KB for one value, and 10 contexts per account. They can change during the beta. Contexts and entries are deleted 30 days after your last sign-in. See the <a href="/privacy">Privacy Policy</a> for details.</p>
<h2>Suspension</h2>
<p>An account or content that breaks these terms or harms the service can be suspended or removed. While an account is suspended, the member cannot sign in, the links of their contexts show nothing, and they cannot read or change their data. Nothing is deleted by the suspension itself, and restoring the account brings everything back. The 30-day deletion still counts from the last sign-in before the suspension.</p>
<h2>Liability</h2>
<p>To the extent the law allows, the person who runs the service is not liable for losses from using the beta, including lost data and the disclosure of a link you shared.</p>
<h2>Changes</h2>
<p>These terms may be updated. The date at the top shows the latest version. If you keep using the service after a change, you accept the new terms.</p>
${x.contact.en}`,
  },

  cookies: {
    title: "Cookie Policy | contextatk (beta)",
    description: "The cookies and local storage contextatk uses. Essential only.",
    en: (x) => `<h1>Cookie Policy</h1>
<p class="muted">${UPDATED.en}</p>
<p>contextatk uses only essential cookies. There are no advertising, analytics or third-party cookies. Because these cookies are needed for the service to work, there is no switch to turn them off. You can clear them in your browser settings.</p>
<h2>Cookies</h2>
<table>
<thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead>
<tbody>
<tr><td dir="ltr">__Host-session</td><td>Keeps you signed in. It holds your account identifier and an expiry time, signed so it cannot be altered. It is HttpOnly and Secure. Signing out removes it.</td><td>7 days</td></tr>
<tr><td dir="ltr">__Host-oauth</td><td>Protects the Google sign-in step. It exists only while you sign in.</td><td>10 minutes</td></tr>
</tbody>
</table>
<h2>Local storage and cache</h2>
<p>These stay in your browser and are not sent to the server.</p>
<ul>
<li><span dir="ltr">notice</span>: that you closed the cookie notice.</li>
<li>Offline cache: a copy of the app shell (page, script, styles, logo and an icon) so the page can open without a connection. It holds no account data and no contexts.</li>
</ul>
<p>See also the <a href="/privacy">Privacy Policy</a>.</p>
${x.contact.en}`,
  },
};

export const PAGE_PATHS = Object.keys(PAGES).map((k) => "/" + k);

// Full HTML for one information page. head values come from the caller (site address, verification tag).
export function infoPage(slug, env, site, verifyTag) {
  const p = PAGES[slug];
  const x = extras(env);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${p.title}</title>
  <meta name="description" content="${p.description}">
  <link rel="canonical" href="${site}/${slug}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#1f6feb">
  <meta name="color-scheme" content="light dark">
  ${verifyTag}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="contextatk">
  <meta property="og:title" content="${p.title}">
  <meta property="og:description" content="${p.description}">
  <meta property="og:url" content="${site}/${slug}">
  <meta property="og:image" content="${site}/icon-512.png">
  <meta name="twitter:card" content="summary">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/app.css">
  <script src="/theme.js"></script>
</head>
<body>
  <header>
    <a class="brand" href="/"><img src="/logo.jpg" alt="" width="32" height="32"><span>contextatk <small>beta</small></span></a>
    <nav><button id="theme" class="link" type="button" aria-label="Dark mode" title="Dark mode"></button></nav>
  </header>
  <main class="doc">
    <article lang="en">${p.en(x)}</article>
  </main>
  ${FOOTER}
  <script src="/common.js" defer></script>
</body>
</html>
`;
}
