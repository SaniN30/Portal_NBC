import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requestOtpSchema } from "@/lib/validation";
import { generateCode, hashCode, normalizeIdentifier, OTP_TTL_MS, OTP_RESEND_COOLDOWN_MS } from "@/lib/otp";
import { sendOtp } from "@/lib/otp-sender";

export async function POST(req: Request) {
  try {
    const parsed = requestOtpSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request");

    const { channel } = parsed.data;
    const identifier = normalizeIdentifier(channel, parsed.data.identifier);

    // Rate limit: block if a code was just issued.
    const recent = await prisma.otpChallenge.findFirst({
      where: { identifier, createdAt: { gt: new Date(Date.now() - OTP_RESEND_COOLDOWN_MS) } },
    });
    if (recent) return fail("Please wait before requesting another code.", 429);

    const code = generateCode();
    await prisma.$transaction([
      prisma.otpChallenge.deleteMany({ where: { identifier } }),
      prisma.otpChallenge.create({
        data: { identifier, channel, codeHash: hashCode(code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
      }),
    ]);

    // Surface delivery failures as a clean 502 instead of a bare crash.
    try {
      await sendOtp(channel, identifier, code);
    } catch (e) {
      console.error("OTP send failed", e);
      await prisma.otpChallenge.deleteMany({ where: { identifier } });
      return fail("Could not send the code. Check the email/phone provider setup.", 502);
    }
    return ok({ sent: true });
  } catch (e) {
    return onError(e);
  }
}
