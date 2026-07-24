import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { promoteAdminSchema } from "@/lib/validation";
import { normalizeIdentifier } from "@/lib/otp";

// Any admin can add another admin (flat model). Seeded neevbridge is the first.
export async function GET() {
  try {
    await requireAdmin();
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      orderBy: { createdAt: "asc" },
      select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
    });
    return ok(admins);
  } catch (e) {
    return onError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const parsed = promoteAdminSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail("Enter a valid email");
    const email = normalizeIdentifier("email", parsed.data.email);
    // Upsert so a not-yet-registered person becomes admin on first login.
    const admin = await prisma.user.upsert({
      where: { email },
      update: { role: "admin" },
      create: { email, role: "admin", emailVerified: false },
      select: { id: true, email: true, role: true },
    });
    return ok(admin);
  } catch (e) {
    return onError(e);
  }
}
