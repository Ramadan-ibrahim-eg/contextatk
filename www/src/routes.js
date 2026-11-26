import { LIMITS, LOGIN_TOUCH_SECONDS } from "./config.js";

const ID_RE = /^[0-9a-f-]{36}$/;
// Operations the page may ask the api worker for. The member is always taken from the session.
const FIELDS = {
  "context.create": ["name"],
  "context.rotate": ["context"],
  "context.pin": ["context", "pin"],
  "context.delete": ["context"],
  "entry.set": ["context", "name", "value"],
  "entry.delete": ["context", "name"],
};

export const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", ...extra },
  });

// Marks the member as active now (at most once per LOGIN_TOUCH_SECONDS). Used by sign-in and by the page.
export async function touchMember(db, id, now) {
  await db
    .prepare("UPDATE members SET last_login = ?2 WHERE id = ?1 AND status = 'active' AND (last_login IS NULL OR last_login < ?3)")
    .bind(id, now, now - LOGIN_TOUCH_SECONDS)
    .run();
}

// Creates the member on first sign-in, refreshes email and name, and refreshes last_login only for an
// active member (a blocked sign-in must not restart the deletion clock). Returns false if not active.
export async function signIn(db, who, now) {
  await db
    .prepare(
      `INSERT INTO members (id, status, last_login, created_at, email, name) VALUES (?1, 'active', ?2, ?2, ?3, ?4)
       ON CONFLICT (id) DO UPDATE SET
         last_login = CASE WHEN members.status = 'active' THEN ?2 ELSE members.last_login END,
         email = COALESCE(?3, members.email),
         name = COALESCE(?4, members.name)`
    )
    .bind(who.sub, now, who.email, who.name)
    .run();
  const m = await db.prepare("SELECT status FROM members WHERE id = ?1").bind(who.sub).first();
  return !!m && m.status === "active";
}

async function activeMember(db, id) {
  const m = await db.prepare("SELECT status FROM members WHERE id = ?1").bind(id).first();
  return !!m && m.status === "active";
}

export async function me(env, member, origin) {
  const used = await env.DB.prepare(
    "SELECT COALESCE(SUM(e.size), 0) AS n FROM entries e JOIN contexts c ON c.id = e.context_id WHERE c.member_id = ?1"
  )
    .bind(member)
    .first();
  const rows = await env.DB.prepare(
    `SELECT c.id, c.name, c.pin IS NOT NULL AS has_pin,
            (SELECT COUNT(*) FROM entries e WHERE e.context_id = c.id) AS entries,
            (SELECT COALESCE(SUM(size), 0) FROM entries e WHERE e.context_id = c.id) AS bytes
       FROM contexts c WHERE c.member_id = ?1 ORDER BY c.created_at, c.id`
  )
    .bind(member)
    .all();
  return json(200, {
    quota: { used: used.n, max: LIMITS.QUOTA_BYTES },
    limits: LIMITS,
    readBase: env.READ_BASE_URL || `${origin}/c/`,
    contexts: rows.results.map((r) => ({ id: r.id, name: r.name, hasPin: !!r.has_pin, entries: r.entries, bytes: r.bytes })),
  });
}

export async function entries(env, member, contextId) {
  if (!ID_RE.test(contextId || "")) return json(400, { ok: false, error: "bad_request" });
  const own = await env.DB.prepare("SELECT 1 AS x FROM contexts WHERE id = ?1 AND member_id = ?2").bind(contextId, member).first();
  if (!own) return json(404, { ok: false, error: "not_found" });
  const rows = await env.DB.prepare("SELECT name, value, size, updated_at FROM entries WHERE context_id = ?1 ORDER BY name").bind(contextId).all();
  return json(200, { ok: true, entries: rows.results });
}

export async function forward(env, member, body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { ok: false, error: "bad_request" });
  const fields = Object.hasOwn(FIELDS, body.op) ? FIELDS[body.op] : null;
  if (!fields) return json(400, { ok: false, error: "bad_request" });
  if (!(await activeMember(env.DB, member))) return json(403, { ok: false, error: "not_member" });
  const out = { op: body.op, member };
  for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
  let res;
  try {
    res = await env.API.fetch("https://api.internal/", {
      method: "POST",
      headers: { authorization: `Bearer ${env.API_SECRET}`, "content-type": "application/json" },
      body: JSON.stringify(out),
    });
  } catch {
    return json(502, { ok: false, error: "unavailable" });
  }
  // Pass the api's answer through (status and body only).
  return json(res.status, await res.json().catch(() => ({ ok: false, error: "internal" })));
}
