"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Me = {
  id: string; fullName: string | null; dob: string | null; phone: string | null;
  email: string | null; role: string; nationality: string | null; aadhaarBlobUrl: string | null;
  resumeBlobUrl: string | null; resumeUploadedAt: string | null;
};

const field = "rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900";

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { api<Me>("/api/me").then(setMe).catch((e) => setMsg(e.message)); }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setMsg("");
    const f = new FormData(e.currentTarget);
    try {
      const updated = await api<Me>("/api/me", {
        method: "PUT",
        body: JSON.stringify({ fullName: f.get("fullName"), dob: f.get("dob"), phone: f.get("phone"), email: f.get("email"), nationality: f.get("nationality") }),
      });
      setMe((m) => ({ ...m!, ...updated }));
      setMsg("Saved.");
    } catch (e) { setMsg((e as Error).message); } finally { setSaving(false); }
  }

  async function uploadResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("Uploading…");
    const fd = new FormData(); fd.append("resume", file);
    try {
      const r = await api<{ resumeBlobUrl: string; resumeUploadedAt: string }>("/api/me/resume", { method: "POST", body: fd });
      setMe((m) => ({ ...m!, ...r })); setMsg("Resume uploaded.");
    } catch (e) { setMsg((e as Error).message); }
  }

  async function uploadAadhaar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("Uploading…");
    const fd = new FormData(); fd.append("aadhaar", file);
    try {
      await api<{ hasAadhaar: boolean }>("/api/me/aadhaar", { method: "POST", body: fd });
      setMe((m) => ({ ...m!, aadhaarBlobUrl: "uploaded" })); setMsg("Aadhaar uploaded.");
    } catch (e) { setMsg((e as Error).message); }
  }

  if (!me) return <main className="mx-auto max-w-lg px-6 py-12"><p className="text-neutral-500">{msg || "Loading…"}</p></main>;

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <nav className="flex gap-4 text-sm text-neutral-500">
          <Link href="/listing" className="hover:underline">Jobs</Link>
          {me.role === "admin" && <Link href="/admin" className="hover:underline">Admin</Link>}
          <button onClick={() => api("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/"))} className="hover:underline">Sign out</button>
        </nav>
      </header>

      <form onSubmit={save} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Full name</span>
          <input name="fullName" required defaultValue={me.fullName ?? ""} className={field} /></label>
        <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Date of birth</span>
          <input name="dob" type="date" required defaultValue={me.dob ? me.dob.slice(0, 10) : ""} className={field} /></label>
        <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Phone</span>
          <input name="phone" type="tel" defaultValue={me.phone ?? ""} className={field} /></label>
        <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Email</span>
          <input name="email" type="email" defaultValue={me.email ?? ""} className={field} /></label>
        <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Nationality</span>
          <input name="nationality" defaultValue={me.nationality ?? ""} placeholder="e.g. Indian" className={field} /></label>
        <button disabled={saving} className="rounded-lg bg-neutral-900 py-2.5 font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <section className="mt-8 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-medium">Resume / CV</h2>
        {me.resumeBlobUrl ? (
          <a href={me.resumeBlobUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-blue-600 hover:underline">
            View current resume
          </a>
        ) : <p className="mt-1 text-sm text-neutral-500">No resume uploaded yet.</p>}
        <label className="mt-3 inline-block cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
          {me.resumeBlobUrl ? "Replace" : "Upload"} (PDF/Word, ≤5 MB)
          <input type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} className="hidden" />
        </label>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-medium">Aadhaar card <span className="text-xs font-normal text-neutral-500">(for verification)</span></h2>
        {me.aadhaarBlobUrl ? (
          <a href="/api/me/aadhaar" target="_blank" rel="noreferrer" className="mt-1 block text-sm text-blue-600 hover:underline">
            View uploaded Aadhaar
          </a>
        ) : <p className="mt-1 text-sm text-neutral-500">No Aadhaar uploaded yet.</p>}
        <label className="mt-3 inline-block cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
          {me.aadhaarBlobUrl ? "Replace" : "Upload"} (PDF/JPG/PNG, ≤5 MB)
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={uploadAadhaar} className="hidden" />
        </label>
      </section>

      {msg && <p role="status" className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{msg}</p>}
    </main>
  );
}
