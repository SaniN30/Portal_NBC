import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { assignRoleSchema } from "@/lib/validation";
import { normalizeIdentifier } from "@/lib/otp";

// Role management is super_admin-only. Lists every staff member (non-candidate).
export async function GET() {
  try {
    await requireRole("super_admin");
    const staff = await prisma.user.findMany({
      where: { role: { not: "candidate" } },
      orderBy: { createdAt: "asc" },
      select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true },
    });
    return ok(staff);
  } catch (e) {
    return onError(e);
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireRole("super_admin");
    const parsed = assignRoleSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
    const email = normalizeIdentifier("email", parsed.data.email);
    const { role } = parsed.data;

    // Don't let a super_admin demote themselves and risk locking everyone out.
    const target = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (target && target.id === me.userId && role !== "super_admin") {
      return fail("You can't change your own super_admin role.", 400);
    }

    // Upsert so a not-yet-registered person gets the role on first login.
    const user = await prisma.user.upsert({
      where: { email },
      update: { role },
      create: { email, role, emailVerified: false },
      select: { id: true, email: true, role: true },
    });
    return ok(user);
  } catch (e) {
    return onError(e);
  }
}
