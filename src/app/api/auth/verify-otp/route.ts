import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { verifyOtpSchema } from "@/lib/validation";
import { codeMatches, isExpired, normalizeIdentifier, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const parsed = verifyOtpSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request");

  const { channel, code } = parsed.data;
  const identifier = normalizeIdentifier(channel, parsed.data.identifier);

  const challenge = await prisma.otpChallenge.findFirst({
    where: { identifier, channel },
    orderBy: { createdAt: "desc" },
  });
  if (!challenge) return fail("Request a code first.", 400);
  if (isExpired(challenge.expiresAt)) {
    await prisma.otpChallenge.deleteMany({ where: { identifier } });
    return fail("Code expired. Request a new one.", 400);
  }
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otpChallenge.deleteMany({ where: { identifier } });
    return fail("Too many attempts. Request a new code.", 429);
  }
  if (!codeMatches(code, challenge.codeHash)) {
    await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    return fail("Incorrect code.", 400);
  }

  // Verified. First login creates the account (login == signup, IdeaV2.md §10).
  const verifiedField = channel === "email" ? { emailVerified: true } : { phoneVerified: true };
  const where = channel === "email" ? { email: identifier } : { phone: identifier };
  const create = channel === "email"
    ? { email: identifier, emailVerified: true }
    : { phone: identifier, phoneVerified: true };

  const user = await prisma.user.upsert({ where, update: verifiedField, create });
  await prisma.otpChallenge.deleteMany({ where: { identifier } });

  await setSessionCookie({ userId: user.id, role: user.role });
  return ok({ userId: user.id, role: user.role });
}
