import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { jobSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    await requireRole("recruiter");
    const { id } = await params;
    const parsed = jobSchema.partial().safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
    const job = await prisma.job.update({ where: { id }, data: parsed.data });
    return ok(job);
  } catch (e) {
    return onError(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireRole("recruiter");
    const { id } = await params;
    // Soft close keeps applications intact; hard delete would cascade them.
    const job = await prisma.job.update({ where: { id }, data: { status: "closed" } });
    return ok(job);
  } catch (e) {
    return onError(e);
  }
}
