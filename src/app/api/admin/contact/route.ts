import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { contactSchema } from "@/lib/validation";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const parsed = contactSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
    const { userId, subject, message } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user?.email) return fail("This candidate has no email on file", 404);

    try {
      await sendMail(user.email, subject, message);
    } catch (e) {
      console.error("contact send failed", e);
      return fail("Could not send the email. Check the provider setup.", 502);
    }
    return ok({ sent: true });
  } catch (e) {
    return onError(e);
  }
}
