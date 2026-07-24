import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";

const SELECT = {
  id: true, fullName: true, dob: true, phone: true, email: true, role: true,
  resumeBlobUrl: true, resumeUploadedAt: true,
} as const;

export async function GET() {
  try {
    const { userId } = await requireSession();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: SELECT });
    return ok(user);
  } catch (e) {
    return onError(e);
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await requireSession();
    const parsed = profileSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
    const { fullName, dob, phone, email } = parsed.data;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { fullName, dob, phone: phone || null, email: email || null },
      select: SELECT,
    });
    return ok(user);
  } catch (e) {
    return onError(e);
  }
}
