// Read-side access check used by GET /c/<token> (src/read.js): the token, PIN
// and hourly lock are decided in one place.
import { LIMITS } from "./limits.js";
import { hourOf, safeEqual, sha256Hex } from "./util.js";

/**
 * Returns { ok: true, context } or { ok: false, reason } where reason is one of
 * "not_found", "suspended", "pin_required", "bad_pin", "locked".
 * Only wrong PINs count as failed attempts; a missing PIN does not.
 */
export async function checkAccess(db, token, pin, now) {
  if (typeof token !== "string" || token.length < 20 || token.length > 200) return { ok: false, reason: "not_found" };
  const ctx = await db
    .prepare("SELECT c.id, c.pin, COALESCE(m.status, 'active') AS status FROM contexts c LEFT JOIN members m ON m.id = c.member_id WHERE c.token_hash = ?1")
    .bind(await sha256Hex(token))
    .first();
  if (!ctx) return { ok: false, reason: "not_found" };
  // A suspended member's links serve nothing (checked before the PIN, so it does not count as a failed attempt).
  if (ctx.status !== "active") return { ok: false, reason: "suspended" };
  if (!ctx.pin) return { ok: true, context: ctx.id };

  const hour = hourOf(now);
  const row = await db.prepare("SELECT failed FROM attempts WHERE context_id = ?1 AND hour = ?2").bind(ctx.id, hour).first();
  if (row && row.failed >= LIMITS.PIN_FAILS_PER_HOUR) return { ok: false, reason: "locked" };

  if (pin === undefined || pin === null || pin === "") return { ok: false, reason: "pin_required" };
  if (await safeEqual(pin, ctx.pin)) return { ok: true, context: ctx.id };

  await db
    .prepare(
      `INSERT INTO attempts (context_id, hour, failed) VALUES (?1, ?2, 1)
       ON CONFLICT (context_id, hour) DO UPDATE SET failed = failed + 1`
    )
    .bind(ctx.id, hour)
    .run();
  return { ok: false, reason: "bad_pin" };
}
