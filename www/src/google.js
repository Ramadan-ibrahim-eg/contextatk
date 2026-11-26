// Google sign-in (authorization code flow with PKCE). We ask for "openid email profile":
// the member id is Google's stable account id ("sub"); the email and name are stored so the
// operator can find an account for support (see the Privacy Policy).
const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";

export const redirectUri = (origin) => `${origin}/auth/callback`;

export function authUrl(env, origin, state, challenge) {
  const p = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `${AUTH}?${p}`;
}

// The id_token comes straight from Google's token endpoint over TLS, so (per Google's docs)
// it is trusted without checking its signature; we still check audience, issuer and expiry.
// Returns { sub, email, name } (email and name may be null) or null.
export async function exchangeCode(env, origin, code, verifier, now) {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!res.ok) return null;
  const { id_token } = await res.json();
  if (typeof id_token !== "string") return null;
  try {
    const part = id_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const c = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part), (x) => x.charCodeAt(0))));
    const issOk = c.iss === "https://accounts.google.com" || c.iss === "accounts.google.com";
    if (!issOk || c.aud !== env.GOOGLE_CLIENT_ID || typeof c.exp !== "number" || c.exp <= now) return null;
    if (typeof c.sub !== "string") return null;
    const clean = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max) || null : null);
    const verified = c.email_verified === true || c.email_verified === "true"; // only a verified email is stored
    return { sub: c.sub, email: verified ? clean(c.email, 254) : null, name: clean(c.name, 200) };
  } catch {
    return null;
  }
}
