import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { getSession } from "@/lib/session";
import { requireRole, isStaff } from "@/lib/auth";
import { jobSchema } from "@/lib/validation";

// Public sees live jobs only; staff see all.
export async function GET() {
  try {
    const session = await getSession();
    const staff = session ? isStaff(session.role) : false;
    const jobs = await prisma.job.findMany({
      where: staff ? {} : { status: "live" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, location: true,
        engineeringField: true, duration: true, timeline: true, ctc: true,
        status: true, createdAt: true },
    });
    return ok(jobs);
  } catch (e) {
    return onError(e);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await requireRole("recruiter");
    const parsed = jobSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
    const d = parsed.data;
    const job = await prisma.job.create({
      data: {
        ...d,
        location: d.location || null,
        engineeringField: d.engineeringField || null,
        duration: d.duration || null,
        timeline: d.timeline || null,
        ctc: d.ctc || null,
        createdById: userId,
      },
    });
    return ok(job, 201);
  } catch (e) {
    return onError(e);
  }
}
