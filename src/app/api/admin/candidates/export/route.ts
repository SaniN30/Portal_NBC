import { prisma } from "@/lib/prisma";
import { onError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

const COLS = ["Name", "Email", "Phone", "Nationality", "Applications", "Has Resume", "Has Aadhaar", "Joined"];

const csvCell = (v: unknown): string => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Admin-only: full candidate list as CSV.
// ponytail: loads all rows in one query — fine to ~tens of thousands. If the
// candidate table grows past that, switch to a cursor-paged streaming response.
export async function GET() {
  try {
    await requireAdmin();
    const rows = await prisma.user.findMany({
      where: { role: "candidate" },
      orderBy: { createdAt: "desc" },
      select: { fullName: true, email: true, phone: true, nationality: true,
        resumeBlobUrl: true, aadhaarBlobUrl: true, createdAt: true, _count: { select: { applications: true } } },
    });

    const lines = rows.map((r) => [
      r.fullName, r.email, r.phone, r.nationality, r._count.applications,
      r.resumeBlobUrl ? "yes" : "no", r.aadhaarBlobUrl ? "yes" : "no",
      r.createdAt.toISOString().slice(0, 10),
    ].map(csvCell).join(","));
    const csv = [COLS.join(","), ...lines].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="candidates-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    return onError(e);
  }
}
