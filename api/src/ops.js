import { LIMITS } from "./limits.js";
import { byteLen, randomToken, sha256Hex } from "./util.js";

const MEMBER_RE = /^[A-Za-z0-9_-]{1,64}$/;
const ID_RE = /^[0-9a-f-]{36}$/;
const PIN_RE = /^\d{7}$/;
const CONTROL_RE = /[\u0000-\u001f\u007f]/;

class Fail extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}
const bad = () => new Fail(400, "bad_request");

const str = (v) => {
  if (typeof v !== "string") throw bad();
  return v;
};
const memberId = (v) => (MEMBER_RE.test(str(v)) ? v : (() => { throw bad(); })());
const contextId = (v) => (ID_RE.test(str(v)) ? v : (() => { throw bad(); })());
function entryName(v) {
  const n = str(v);
  const len = byteLen(n);
  if (len < 1 || len > LIMITS.NAME_MAX_BYTES || CONTROL_RE.test(n)) throw bad();
  return n;
}

async function requireActiveMember(db, member) {
  const row = await db.prepare("SELECT status FROM members WHERE id = ?1").bind(member).first();
  if (!row || row.status !== "active") throw new Fail(403, "not_member");
}

async function owns(db, member, context) {
  const r = await db.prepare("SELECT 1 AS x FROM contexts WHERE id = ?1 AND member_id = ?2").bind(context, member).first();
  return !!r;
}

const OPS = {
  async "context.create"(db, b, now) {
    const member = memberId(b.member);
    const name = b.name === undefined ? "" : str(b.name);
    if ([...name].length > LIMITS.CONTEXT_NAME_MAX_CHARS || CONTROL_RE.test(name)) throw bad();
    await requireActiveMember(db, member);
    const id = crypto.randomUUID();
    const token = randomToken();
    const r = await db
      .prepare(
        `INSERT INTO contexts (id, member_id, name, token_hash, created_at)
         SELECT ?1, ?2, ?3, ?4, ?5
         WHERE (SELECT COUNT(*) FROM contexts WHERE member_id = ?2) < ?6`
      )
      .bind(id, member, name, await sha256Hex(token), now, LIMITS.CONTEXTS_PER_MEMBER)
      .run();
    if (r.meta.changes !== 1) throw new Fail(409, "too_many_contexts");
    // The only thing returned: the new context id and its secret token (shown once, never stored in clear).
    return { context: id, token };
  },

  async "context.rotate"(db, b) {
    const member = memberId(b.member);
    const context = contextId(b.context);
    await requireActiveMember(db, member);
    const token = randomToken();
    const [r] = await db.batch([
      db.prepare("UPDATE contexts SET token_hash = ?1 WHERE id = ?2 AND member_id = ?3").bind(await sha256Hex(token), context, member),
      db.prepare("DELETE FROM attempts WHERE context_id = ?1").bind(context),
    ]);
    if (r.meta.changes !== 1) throw new Fail(404, "not_found");
    return { token };
  },

  async "context.pin"(db, b) {
    const member = memberId(b.member);
    const context = contextId(b.context);
    let pin = b.pin;
    if (pin !== null) {
      if (!PIN_RE.test(str(pin))) throw bad();
    }
    await requireActiveMember(db, member);
    const [r] = await db.batch([
      db.prepare("UPDATE contexts SET pin = ?1 WHERE id = ?2 AND member_id = ?3").bind(pin, context, member),
      db.prepare("DELETE FROM attempts WHERE context_id = ?1").bind(context),
    ]);
    if (r.meta.changes !== 1) throw new Fail(404, "not_found");
    return {};
  },

  async "context.delete"(db, b) {
    const member = memberId(b.member);
    const context = contextId(b.context);
    await requireActiveMember(db, member);
    if (!(await owns(db, member, context))) throw new Fail(404, "not_found");
    await db.batch([
      db.prepare("DELETE FROM entries WHERE context_id = ?1").bind(context),
      db.prepare("DELETE FROM attempts WHERE context_id = ?1").bind(context),
      db.prepare("DELETE FROM contexts WHERE id = ?1 AND member_id = ?2").bind(context, member),
    ]);
    return {};
  },

  async "entry.set"(db, b, now) {
    const member = memberId(b.member);
    const context = contextId(b.context);
    const name = entryName(b.name);
    const value = str(b.value);
    const valueBytes = byteLen(value);
    if (valueBytes > LIMITS.VALUE_MAX_BYTES) throw new Fail(413, "value_too_large");
    const size = byteLen(name) + valueBytes;
    await requireActiveMember(db, member);
    // One atomic statement: checks ownership and the member's total quota, then writes.
    const r = await db
      .prepare(
        `INSERT INTO entries (context_id, name, value, size, updated_at)
         SELECT ?1, ?2, ?3, ?4, ?5
         WHERE EXISTS (SELECT 1 FROM contexts WHERE id = ?1 AND member_id = ?6)
           AND (SELECT COALESCE(SUM(e.size), 0) FROM entries e
                  JOIN contexts c ON c.id = e.context_id
                 WHERE c.member_id = ?6 AND NOT (e.context_id = ?1 AND e.name = ?2)) + ?4 <= ?7
         ON CONFLICT (context_id, name) DO UPDATE
           SET value = excluded.value, size = excluded.size, updated_at = excluded.updated_at`
      )
      .bind(context, name, value, size, now, member, LIMITS.QUOTA_BYTES)
      .run();
    if (r.meta.changes !== 1) {
      throw (await owns(db, member, context)) ? new Fail(409, "quota_exceeded") : new Fail(404, "not_found");
    }
    return {};
  },

  async "entry.delete"(db, b) {
    const member = memberId(b.member);
    const context = contextId(b.context);
    const name = entryName(b.name);
    await requireActiveMember(db, member);
    if (!(await owns(db, member, context))) throw new Fail(404, "not_found");
    await db.prepare("DELETE FROM entries WHERE context_id = ?1 AND name = ?2").bind(context, name).run();
    return {};
  },
};

export async function runOp(db, body, now) {
  try {
    if (!body || typeof body !== "object" || Array.isArray(body)) throw bad();
    const op = OPS[Object.hasOwn(OPS, body.op) ? body.op : ""];
    if (!op) throw bad();
    return { status: 200, body: { ok: true, ...(await op(db, body, now)) } };
  } catch (e) {
    if (e instanceof Fail) return { status: e.status, body: { ok: false, error: e.code } };
    console.error("internal error", e && e.message);
    return { status: 500, body: { ok: false, error: "internal" } };
  }
}
