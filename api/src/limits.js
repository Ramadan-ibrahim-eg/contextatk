// All limits in one place. Sizes are UTF-8 bytes.
export const LIMITS = {
  QUOTA_BYTES: 500 * 1024,        // per member, shared by all of the member's contexts
  VALUE_MAX_BYTES: 100 * 1024,    // one value
  NAME_MAX_BYTES: 128,            // one entry name
  CONTEXT_NAME_MAX_CHARS: 100,
  CONTEXTS_PER_MEMBER: 10,
  PIN_FAILS_PER_HOUR: 10,         // per context
  RETENTION_DAYS: 30,             // after the member's last login
  BODY_MAX_BYTES: 100 * 1024 + 4096,
};
