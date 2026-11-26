export const SESSION_SECONDS = 7 * 24 * 3600;
export const LOGIN_TOUCH_SECONDS = 3600; // refresh last_login at most once an hour while active
export const SESSION_COOKIE = "__Host-session";
export const OAUTH_COOKIE = "__Host-oauth";

// Must match the api worker's limits (api/src/limits.js). They are shown in the UI;
// the api worker is the one that enforces them.
export const LIMITS = {
  QUOTA_BYTES: 500 * 1024,
  VALUE_MAX_BYTES: 100 * 1024,
  NAME_MAX_BYTES: 128,
  CONTEXTS_PER_MEMBER: 10,
  RETENTION_DAYS: 30,
};
