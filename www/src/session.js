import { SESSION_SECONDS } from "./config.js";

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const hmacKey = (secret) => crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

export const SUB_RE = /^[A-Za-z0-9_-]{1,64}$/;

export async function signSession(secret, sub, now) {
  const payload = b64u(enc.encode(JSON.stringify({ sub, exp: now + SESSION_SECONDS })));
  const sig = b64u(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload)));
  return `${payload}.${sig}`;
}

// Returns the member id, or null. Signature check is constant time (WebCrypto verify).
export async function readSession(secret, value, now) {
  try {
    if (!secret || !value) return null;
    const [payload, sig, extra] = value.split(".");
    if (!payload || !sig || extra !== undefined) return null;
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), fromB64u(sig), enc.encode(payload));
    if (!ok) return null;
    const { sub, exp } = JSON.parse(new TextDecoder().decode(fromB64u(payload)));
    if (typeof sub !== "string" || !SUB_RE.test(sub) || typeof exp !== "number" || exp <= now) return null;
    return sub;
  } catch {
    return null;
  }
}

export function getCookie(request, name) {
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

export const setCookie = (name, value, maxAge) =>
  `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;

export const randomB64u = (bytes = 32) => b64u(crypto.getRandomValues(new Uint8Array(bytes)));
export const sha256B64u = async (s) => b64u(await crypto.subtle.digest("SHA-256", enc.encode(s)));
