import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { fail, onError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

// Admin-only: stream a candidate's private Aadhaar for verification.
export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { aadhaarBlobUrl: true } });
    if (!user?.aadhaarBlobUrl) return fail("No Aadhaar uploaded", 404);
    const res = await get(user.aadhaarBlobUrl, { access: "private" });
    if (!res) return fail("Aadhaar file not found", 404);
    return new Response(res.stream, { headers: Object.fromEntries(res.headers) });
  } catch (e) {
    return onError(e);
  }
}
