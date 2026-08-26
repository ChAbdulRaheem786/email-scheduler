const EMAIL_RE = /^[^\s@<>",\r\n]+@[^\s@<>",\r\n]+\.[^\s@<>",\r\n]{2,}$/;

// `to`/`cc`/`bcc` may be a single address or a comma-separated list.
export function isValidEmailList(value) {
  if (!value) return true; // optional fields
  const parts = value.split(",").map((s) => s.trim());
  return parts.length > 0 && parts.every((addr) => EMAIL_RE.test(addr));
}

export const LIMITS = {
  ADDRESS: 500,
  SUBJECT: 300,
  BODY: 20000,
  AI_INSTRUCTIONS: 2000,
};

// Defense-in-depth: strips CR/LF so nothing can smuggle extra headers into a
// raw MIME message, even if it somehow got past upstream validation.
export function stripHeaderInjection(value) {
  if (value == null) return value;
  return String(value).replace(/[\r\n]+/g, " ").trim();
}
