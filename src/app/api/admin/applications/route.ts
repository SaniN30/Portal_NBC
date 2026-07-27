import { prisma } from "@/lib/prisma";
import { ok, onError } from "@/lib/api";
import { requireRole } from "@/lib/auth";

const PAGE = 25;

// All applications, newest first, keyset-paginated (?cursor=<lastId>).
export async function GET(req: Request) {
  try {
    await requireRole("hiring_manager");
    const cursor = new URL(req.url).searchParams.get("cursor");
    const rows = await prisma.application.findMany({
      take: PAGE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { appliedAt: "desc" },
      select: {
        id: true, status: true, appliedAt: true,
        user: { select: { id: true, fullName: true, email: true } },
        job: { select: { id: true, title: true } },
      },
    });
    const hasMore = rows.length > PAGE;
    const items = hasMore ? rows.slice(0, PAGE) : rows;
    return ok({ items, nextCursor: hasMore ? items[items.length - 1].id : null });
  } catch (e) {
    return onError(e);
  }
}
