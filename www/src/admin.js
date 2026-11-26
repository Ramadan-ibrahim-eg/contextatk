// Admin area: find a member by name, email or account id, and change membership status.
// Only the member whose verified Google email equals ADMIN_EMAIL can use it. For everyone else every
// admin path answers exactly like an unknown page (404). No link anywhere, noindex, never shows entry content.
import { SUB_RE, sha256B64u } from "./session.js";
import { SECURITY } from "./static.js";
import { ADMIN_PAGE, ADMIN_SCRIPT } from "./adminui.js";

const HEAD = { ...SECURITY, "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...HEAD, "content-type": "application/json" } });
const page = (body, type) => new Response(body, { headers: { ...HEAD, "content-type": type } });

// The admin is the member whose stored (Google-verified) email equals ADMIN_EMAIL, compared in lower case
// and in constant time. Looked up in the database on every admin request; the member must also be active.
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}$/;
export async function isAdmin(env, member) {
  if (!member || typeof env.ADMIN_EMAIL !== "string" || !EMAIL_RE.test(env.ADMIN_EMAIL.trim())) return false;
  const row = await env.DB.prepare("SELECT email, status FROM members WHERE id = ?1").bind(member).first();
  if (!row || row.status !== "active" || typeof row.email !== "string") return false;
  const [a, b] = await Promise.all([sha256B64u(row.email.toLowerCase()), sha256B64u(env.ADMIN_EMAIL.trim().toLowerCase())]);
  let diff = a.length ^ b.length;
  for (let i = 0; i < a.length && i < b.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const STATUSES = ["active", "suspended"];

// Returns a Response for the admin, or null (caller answers 404) for everyone else and for unknown admin paths.
export async function handleAdmin(request, env, url, member, now) {
  if (!(await isAdmin(env, member))) return null;
  const path = url.pathname;
  const get = request.method === "GET";

  if (get && path === "/admin") return page(ADMIN_PAGE, "text/html; charset=utf-8");
  if (get && path === "/admin/app.js") return page(ADMIN_SCRIPT, "text/javascript; charset=utf-8");

  if (get && path === "/admin/api/search") {
    const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
    const like = "%" + q.toLowerCase().replace(/[\\%_]/g, "\\$&") + "%";
    const rows = await env.DB.prepare(
      `SELECT m.id, m.name, m.email, m.status, m.created_at, m.last_login,
              (SELECT COUNT(*) FROM contexts c WHERE c.member_id = m.id) AS contexts,
              (SELECT COUNT(*) FROM entries e JOIN contexts c ON c.id = e.context_id WHERE c.member_id = m.id) AS entries,
              (SELECT COALESCE(SUM(e.size), 0) FROM entries e JOIN contexts c ON c.id = e.context_id WHERE c.member_id = m.id) AS bytes
         FROM members m
        WHERE ?1 = '' OR lower(m.email) LIKE ?2 ESCAPE '\\' OR lower(m.name) LIKE ?2 ESCAPE '\\' OR m.id = ?1
        ORDER BY COALESCE(m.last_login, m.created_at) DESC LIMIT 20`
    )
      .bind(q, like)
      .all();
    return json(200, { ok: true, members: rows.results.map((r) => ({ ...r, self: r.id === member })) });
  }

  if (get && path === "/admin/api/log") {
    const rows = await env.DB.prepare(
      `SELECT l.at, l.member_id, l.old_status, l.new_status, m.email, m.name
         FROM admin_log l LEFT JOIN members m ON m.id = l.member_id ORDER BY l.id DESC LIMIT 20`
    ).all();
    return json(200, { ok: true, log: rows.results });
  }

  if (request.method === "POST" && path === "/admin/api/status") {
    if (request.headers.get("origin") !== url.origin || !(request.headers.get("content-type") || "").startsWith("application/json")) {
      return json(403, { ok: false, error: "forbidden" });
    }
    let body;
    try { body = JSON.parse(await request.text()); } catch { return json(400, { ok: false, error: "bad_request" }); }
    const target = body && body.member, status = body && body.status;
    if (typeof target !== "string" || !SUB_RE.test(target) || !STATUSES.includes(status)) return json(400, { ok: false, error: "bad_request" });
    if (target === member) return json(400, { ok: false, error: "cannot_change_self" });
    const old = await env.DB.prepare("SELECT status FROM members WHERE id = ?1").bind(target).first();
    if (!old) return json(404, { ok: false, error: "not_found" });
    if (old.status !== status) {
      await env.DB.batch([
        env.DB.prepare("UPDATE members SET status = ?2 WHERE id = ?1").bind(target, status),
        env.DB.prepare("INSERT INTO admin_log (at, admin_id, member_id, old_status, new_status) VALUES (?1, ?2, ?3, ?4, ?5)").bind(now, member, target, old.status, status),
      ]);
    }
    return json(200, { ok: true, status });
  }

  return null;
}
