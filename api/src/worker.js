import { LIMITS } from "./limits.js";
import { cleanup } from "./cleanup.js";
import { runOp } from "./ops.js";
import { handleRead } from "./read.js";
import { byteLen, safeEqual } from "./util.js";

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default {
  // POST /  : write path, secret-protected, never returns stored data.
  // GET /c/<token> : public read-only path for models (token + optional PIN).
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/c/")) return handleRead(request, env, url);
    if (url.pathname !== "/") return json(404, { ok: false, error: "not_found" });
    if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

    const secret = env.API_SECRET;
    if (!secret) return json(500, { ok: false, error: "internal" }); // misconfigured: deny
    const auth = request.headers.get("authorization") || "";
    const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!(await safeEqual(given, secret))) return json(401, { ok: false, error: "unauthorized" });

    const declared = Number(request.headers.get("content-length") || 0);
    if (declared > LIMITS.BODY_MAX_BYTES) return json(413, { ok: false, error: "value_too_large" });
    const text = await request.text();
    if (byteLen(text) > LIMITS.BODY_MAX_BYTES) return json(413, { ok: false, error: "value_too_large" });
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return json(400, { ok: false, error: "bad_request" });
    }
    const r = await runOp(env.DB, body, Math.floor(Date.now() / 1000));
    return json(r.status, r.body);
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(cleanup(env.DB, Math.floor(Date.now() / 1000)));
  },
};
