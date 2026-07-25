import { put, get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireSession } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

// Upload Aadhaar to PRIVATE blob storage. We store the pathname (not a public
// URL) — the file is only reachable by streaming it back through an
// auth-checked route (GET below, or the admin route).
export async function POST(req: Request) {
  try {
    const { userId } = await requireSession();
    const form = await req.formData();
    const file = form.get("aadhaar");
    if (!(file instanceof File)) return fail("No file uploaded");
    if (!ALLOWED.includes(file.type)) return fail("Aadhaar must be a PDF, JPG, or PNG");
    if (file.size > MAX_BYTES) return fail("Aadhaar must be under 5 MB");

    const blob = await put(`aadhaar/${userId}-${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type,
    });

    await prisma.user.update({ where: { id: userId }, data: { aadhaarBlobUrl: blob.pathname } });
    return ok({ hasAadhaar: true });
  } catch (e) {
    return onError(e);
  }
}

// Stream the caller's own Aadhaar. No public URL is ever exposed.
export async function GET() {
  try {
    const { userId } = await requireSession();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { aadhaarBlobUrl: true } });
    if (!user?.aadhaarBlobUrl) return fail("No Aadhaar uploaded", 404);
    const res = await get(user.aadhaarBlobUrl, { access: "private" });
    if (!res) return fail("Aadhaar file not found", 404);
    return new Response(res.stream, { headers: Object.fromEntries(res.headers) });
  } catch (e) {
    return onError(e);
  }
}
