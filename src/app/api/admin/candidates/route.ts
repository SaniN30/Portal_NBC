import { prisma } from "@/lib/prisma";
import { ok, onError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

const PAGE = 25;

// Keyset pagination (IdeaV2.md §11): ?cursor=<lastId>. Lean columns only.
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const cursor = new URL(req.url).searchParams.get("cursor");
    const rows = await prisma.user.findMany({
      where: { role: "candidate" },
      take: PAGE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: "asc" },
      select: { id: true, fullName: true, email: true, phone: true, nationality: true,
        resumeBlobUrl: true, aadhaarBlobUrl: true, createdAt: true, _count: { select: { applications: true } } },
    });
    const hasMore = rows.length > PAGE;
    const items = hasMore ? rows.slice(0, PAGE) : rows;
    return ok({ items, nextCursor: hasMore ? items[items.length - 1].id : null });
  } catch (e) {
    return onError(e);
  }
}
