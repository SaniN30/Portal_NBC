import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireSession } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

export async function POST(req: Request) {
  try {
    const { userId } = await requireSession();
    const form = await req.formData();
    const file = form.get("aadhaar");
    if (!(file instanceof File)) return fail("No file uploaded");
    if (!ALLOWED.includes(file.type)) return fail("Aadhaar must be a PDF, JPG, or PNG");
    if (file.size > MAX_BYTES) return fail("Aadhaar must be under 5 MB");

    // ponytail: public blob with random suffix (unguessable URL). Aadhaar is
    // sensitive PII — upgrade to private + signed download URLs before real use.
    const blob = await put(`aadhaar/${userId}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { aadhaarBlobUrl: blob.url },
      select: { aadhaarBlobUrl: true },
    });
    return ok(user);
  } catch (e) {
    return onError(e);
  }
}
