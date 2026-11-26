import { LIMITS } from "./limits.js";
import { hourOf } from "./util.js";

// Deletes every context (and its entries) of members whose last login is older
// than the retention period, plus contexts whose member no longer exists.
export async function cleanup(db, now) {
  const cutoff = now - LIMITS.RETENTION_DAYS * 86400;
  const expired = `SELECT c.id FROM contexts c LEFT JOIN members m ON m.id = c.member_id
                    WHERE m.id IS NULL OR COALESCE(m.last_login, m.created_at) < ?1`;
  const res = await db.batch([
    db.prepare(`DELETE FROM entries WHERE context_id IN (${expired})`).bind(cutoff),
    db.prepare(`DELETE FROM attempts WHERE context_id IN (${expired})`).bind(cutoff),
    db.prepare(`DELETE FROM contexts WHERE id IN (${expired})`).bind(cutoff),
    db.prepare("DELETE FROM attempts WHERE hour < ?1").bind(hourOf(now) - 2),
  ]);
  return { contexts: res[2].meta.changes, entries: res[0].meta.changes };
}
