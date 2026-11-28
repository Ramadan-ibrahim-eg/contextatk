import { OAUTH_COOKIE, SESSION_COOKIE, SESSION_SECONDS } from "./config.js";
import { authUrl, exchangeCode } from "./google.js";
import { entries, forward, json, me, signIn, touchMember } from "./routes.js";
import { handleAdmin } from "./admin.js";
import { serveStatic } from "./static.js";
import { getCookie, randomB64u, readSession, setCookie, sha256B64u, signSession } from "./session.js";

const HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
  "x-robots-tag": "noindex, nofollow", // everything except the public page files (see static.js)
};
const text = (status, body, extra = {}) =>
  new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", ...HEADERS, ...extra } });
const redirect = (to, cookies = []) => {
  const h = new Headers({ location: to, "cache-control": "no-store", ...HEADERS });
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(null, { status: 302, headers: h });
};

function sameOriginJson(request, origin) {
  const o = request.headers.get("origin");
  if (o !== origin) return false;
  return (request.headers.get("content-type") || "").startsWith("application/json");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const now = Math.floor(Date.now() / 1000);
    const path = url.pathname;
    try {
      // A signed-in member gets the app shell, never the landing page with "Sign in with Google".
      const app = path === "/" && !!(await readSession(env.SESSION_SECRET, getCookie(request, SESSION_COOKIE), now));
      const page = serveStatic(request, path, env, url.origin, app);
      if (page) return page;

      if (path === "/auth/login" && request.method === "GET") {
        if (!env.GOOGLE_CLIENT_ID || !env.SESSION_SECRET) return text(503, "Sign-in is not configured yet.");
        const state = randomB64u(), verifier = randomB64u(48);
        const to = authUrl(env, url.origin, state, await sha256B64u(verifier));
        return redirect(to, [setCookie(OAUTH_COOKIE, `${state}.${verifier}`, 600)]);
      }

      if (path === "/auth/callback" && request.method === "GET") {
        const saved = (getCookie(request, OAUTH_COOKIE) || "").split(".");
        const clear = setCookie(OAUTH_COOKIE, "", 0);
        const state = url.searchParams.get("state"), code = url.searchParams.get("code");
        if (saved.length !== 2 || !state || state !== saved[0] || !code) return redirect("/?error=signin", [clear]);
        const who = await exchangeCode(env, url.origin, code, saved[1], now);
        if (!who || !/^[A-Za-z0-9_-]{1,64}$/.test(who.sub)) return redirect("/?error=signin", [clear]);
        if (!(await signIn(env.DB, who, now))) return redirect("/?error=suspended", [clear]);
        return redirect("/", [clear, setCookie(SESSION_COOKIE, await signSession(env.SESSION_SECRET, who.sub, now), SESSION_SECONDS)]);
      }

      if (path === "/auth/logout" && request.method === "POST") {
        if (request.headers.get("origin") !== url.origin) return text(403, "Forbidden");
        return redirect("/", [setCookie(SESSION_COOKIE, "", 0)]);
      }

      if (path === "/admin" || path.startsWith("/admin/")) {
        // Only the admin (ADMIN_EMAIL) gets anything here. Everyone else falls through to the plain 404 below.
        const who = await readSession(env.SESSION_SECRET, getCookie(request, SESSION_COOKIE), now);
        const res = await handleAdmin(request, env, url, who, now);
        if (res) return res;
      }

      if (path.startsWith("/api/")) {
        const member = await readSession(env.SESSION_SECRET, getCookie(request, SESSION_COOKIE), now);
        // /api/me answers 200 when signed out, so a visitor's browser console stays clean.
        if (!member) return path === "/api/me" ? json(200, { ok: false, error: "signed_out" }) : json(401, { ok: false, error: "signed_out" });
        // A suspended member gets nothing: the session is ended on this request and the page shows why.
        const row = await env.DB.prepare("SELECT status FROM members WHERE id = ?1").bind(member).first();
        if (!row || row.status !== "active") {
          return json(401, { ok: false, error: row ? "suspended" : "signed_out" }, { "set-cookie": setCookie(SESSION_COOKIE, "", 0) });
        }
        if (path === "/api/me" && request.method === "GET") {
          await touchMember(env.DB, member, now);
          return me(env, member, url.origin);
        }
        if (path === "/api/entries" && request.method === "GET") return entries(env, member, url.searchParams.get("context"));
        if (path === "/api/do" && request.method === "POST") {
          if (!sameOriginJson(request, url.origin)) return json(403, { ok: false, error: "forbidden" });
          const raw = await request.text();
          if (raw.length > 110000) return json(413, { ok: false, error: "value_too_large" });
          let body;
          try { body = JSON.parse(raw); } catch { return json(400, { ok: false, error: "bad_request" }); }
          return forward(env, member, body);
        }
      }
      return text(404, "Not found");
    } catch (e) {
      console.error("internal error", e && e.message);
      return json(500, { ok: false, error: "internal" });
    }
  },
};
