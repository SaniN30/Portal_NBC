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

    // Only offer channels that have a provider configured. Phone stays off until
    // Twilio is set, so users never hit a "no provider" crash.
    if (channel === "phone" && !(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)) {
      return fail("Phone login isn't available yet — please sign in with email.", 400);
    }

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
