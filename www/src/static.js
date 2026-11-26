import { ICON_180, ICON_192, ICON_48, ICON_512 } from "./icons.js";
import { COMMON } from "./common.js";
import { FOOTER, PAGE_PATHS, infoPage } from "./pages.js";
import { LOGO_BASE64 } from "./logo.js";
import { PAGE } from "./page.js";
import { SCRIPT } from "./script.js";
import { SERVICE_WORKER } from "./serviceworker.js";
import { llmsTxt, manifestJson, robotsTxt, sitemapXml } from "./seo.js";
import { STYLE } from "./style.js";
import { THEME } from "./theme.js";

// Security headers on every page response. Scripts and styles only from this site, no framing.
export const SECURITY = {
  "content-security-policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
};

const decoded = new Map(); // base64 -> bytes, decoded once per worker instance
const bytes = (b64) => {
  if (!decoded.has(b64)) decoded.set(b64, Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
  return decoded.get(b64);
};

// Public address used in canonical links, the sitemap and llms.txt. Set SITE_URL (a variable) to your
// own domain once you have one; otherwise the address of the request is used.
const SITE_RE = /^https:\/\/[A-Za-z0-9.-]+(:\d+)?$/;
const siteOf = (env, origin) => (env.SITE_URL && SITE_RE.test(env.SITE_URL) ? env.SITE_URL : origin);

// Optional Google Search Console "HTML tag" verification: set GOOGLE_SITE_VERIFICATION (a variable) to the token.
const VERIFY_RE = /^[A-Za-z0-9_-]{10,100}$/;
const verifyTag = (env) =>
  env.GOOGLE_SITE_VERIFICATION && VERIFY_RE.test(env.GOOGLE_SITE_VERIFICATION)
    ? `<meta name="google-site-verification" content="${env.GOOGLE_SITE_VERIFICATION}">`
    : "";

const TEXT = "text/plain; charset=utf-8";
const PNG = "image/png";
const DAY = "public, max-age=86400";

const FILES = {
  "/": (c) => ({
    body: PAGE.replaceAll("{{SITE}}", c.site).replace("{{VERIFY}}", verifyTag(c.env)).replace("{{FOOTER}}", FOOTER),
    type: "text/html; charset=utf-8",
    cache: "no-cache",
  }),
  "/common.js": () => ({ body: COMMON, type: "text/javascript; charset=utf-8", cache: "public, max-age=300" }),
  "/theme.js": () => ({ body: THEME, type: "text/javascript; charset=utf-8", cache: "public, max-age=300" }),
  "/app.js": () => ({ body: SCRIPT, type: "text/javascript; charset=utf-8", cache: "public, max-age=300" }),
  "/app.css": () => ({ body: STYLE, type: "text/css; charset=utf-8", cache: "public, max-age=300" }),
  "/logo.jpg": () => ({ body: bytes(LOGO_BASE64), type: "image/jpeg", cache: "public, max-age=3600" }),
  "/icon-512.png": () => ({ body: bytes(ICON_512), type: PNG, cache: DAY }),
  "/icon-192.png": () => ({ body: bytes(ICON_192), type: PNG, cache: DAY }),
  "/apple-touch-icon.png": () => ({ body: bytes(ICON_180), type: PNG, cache: DAY }),
  "/favicon.ico": () => ({ body: bytes(ICON_48), type: PNG, cache: DAY }),
  "/manifest.webmanifest": () => ({ body: manifestJson(), type: "application/manifest+json; charset=utf-8", cache: "public, max-age=3600" }),
  "/robots.txt": (c) => ({ body: robotsTxt(c.site), type: TEXT, cache: "public, max-age=3600" }),
  "/sitemap.xml": (c) => ({ body: sitemapXml(c.site), type: "application/xml; charset=utf-8", cache: "public, max-age=3600" }),
  "/llms.txt": (c) => ({ body: llmsTxt(c.site, c.readBase), type: TEXT, cache: "public, max-age=3600" }),
  "/sw.js": () => ({ body: SERVICE_WORKER, type: "text/javascript; charset=utf-8", cache: "no-cache", extra: { "service-worker-allowed": "/" } }),
};
for (const path of PAGE_PATHS) {
  FILES[path] = (c) => ({ body: infoPage(path.slice(1), c.env, c.site, verifyTag(c.env)), type: "text/html; charset=utf-8", cache: "no-cache" });
}

// Returns a Response for a page file, or null if the path is not one of them.
export function serveStatic(request, path, env, origin) {
  if (!Object.hasOwn(FILES, path)) return null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD", ...SECURITY } });
  }
  const f = FILES[path]({ env, site: siteOf(env, origin), readBase: env.READ_BASE_URL || `${origin}/c/` });
  return new Response(request.method === "HEAD" ? null : f.body, {
    headers: { "content-type": f.type, "cache-control": f.cache, ...SECURITY, ...(f.extra || {}) },
  });
}
