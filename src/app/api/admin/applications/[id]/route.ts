import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { applicationStatusSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireRole("hiring_manager");
    const { id } = await params;
    const parsed = applicationStatusSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail("Invalid status");
    const app = await prisma.application.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });
    return ok(app);
  } catch (e) {
    return onError(e);
  }
}
