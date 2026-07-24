import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { z } from "zod";

const applySchema = z.object({ jobId: z.string().min(1) });

export async function GET() {
  try {
    const { userId } = await requireSession();
    const apps = await prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: "desc" },
      select: { id: true, status: true, appliedAt: true,
        job: { select: { id: true, title: true, status: true } } },
    });
    return ok(apps);
  } catch (e) {
    return onError(e);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await requireSession();
    const parsed = applySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail("Invalid request");
    const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId }, select: { status: true } });
    if (!job || job.status !== "live") return fail("This job is no longer open", 404);
    try {
      const app = await prisma.application.create({ data: { userId, jobId: parsed.data.jobId } });
      return ok(app, 201);
    } catch {
      return fail("You have already applied to this job", 409); // unique(userId, jobId)
    }
  } catch (e) {
    return onError(e);
  }
}
