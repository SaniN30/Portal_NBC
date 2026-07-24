import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { ok, fail, onError } from "@/lib/api";
import { requireSession } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function POST(req: Request) {
  try {
    const { userId } = await requireSession();
    const form = await req.formData();
    const file = form.get("resume");
    if (!(file instanceof File)) return fail("No file uploaded");
    if (!ALLOWED.includes(file.type)) return fail("Resume must be PDF or Word");
    if (file.size > MAX_BYTES) return fail("Resume must be under 5 MB");

    // ponytail: public blob with random suffix (unguessable URL). Upgrade to
    // private + signed download URLs if resume PII must be strictly access-gated.
    const blob = await put(`resumes/${userId}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { resumeBlobUrl: blob.url, resumeUploadedAt: new Date() },
      select: { resumeBlobUrl: true, resumeUploadedAt: true },
    });
    return ok(user);
  } catch (e) {
    return onError(e);
  }
}
