import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 min
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;

export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function codeMatches(code: string, codeHash: string): boolean {
  const a = Buffer.from(hashCode(code));
  const b = Buffer.from(codeHash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

// Normalize so the same user can't sidestep rate limits with casing/spacing.
export function normalizeIdentifier(channel: "email" | "phone", raw: string): string {
  const v = raw.trim();
  return channel === "email" ? v.toLowerCase() : v.replace(/[\s()-]/g, "");
}

if (process.argv[1]?.endsWith("otp.ts")) {
  // ponytail: self-check, run with `tsx src/lib/otp.ts`
  const code = generateCode();
  const h = hashCode(code);
  console.assert(/^\d{6}$/.test(code), "code is 6 digits");
  console.assert(codeMatches(code, h), "correct code matches");
  console.assert(!codeMatches("000000", hashCode("111111")), "wrong code rejected");
  console.assert(isExpired(new Date(Date.now() - 1)), "past expiry is expired");
  console.assert(!isExpired(new Date(Date.now() + 1000)), "future expiry is valid");
  console.assert(normalizeIdentifier("email", " A@B.CO ") === "a@b.co", "email normalized");
  console.assert(normalizeIdentifier("phone", "+1 (555) 123-4567") === "+15551234567", "phone normalized");
  console.log("otp.ts self-check passed");
}
