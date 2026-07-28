"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Me = {
  id: string; fullName: string | null; dob: string | null; phone: string | null;
  email: string | null; role: string; nationality: string | null; aadhaarBlobUrl: string | null;
  resumeBlobUrl: string | null; resumeUploadedAt: string | null;
};

function initials(name: string | null, email: string | null): string {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

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

  if (!me) return <main className="mx-auto max-w-2xl px-6 py-12"><p className="text-[var(--muted)]">{msg || "Loading…"}</p></main>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      {/* Identity header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] font-display text-lg font-bold text-[var(--brand-600)]">
            {initials(me.fullName, me.email)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-bold tracking-tight">{me.fullName || "Your profile"}</h1>
            <p className="truncate text-sm text-[var(--muted)]">
              {me.email || "No email set"}
              {me.role !== "candidate" && <span className="badge ml-2 border-[color-mix(in_oklab,var(--brand)_35%,var(--border))] text-[var(--brand-600)]">Staff</span>}
            </p>
          </div>
        </div>
        <nav className="flex shrink-0 gap-2 text-sm">
          <Link href="/listing" className="btn btn-ghost px-3 py-1.5">Jobs</Link>
          {me.role !== "candidate" && <Link href="/admin" className="btn btn-ghost px-3 py-1.5">Admin</Link>}
          <button onClick={() => api("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/"))} className="btn btn-ghost px-3 py-1.5">Sign out</button>
        </nav>
      </header>

      {/* Personal details */}
      <section data-reveal-css className="card mt-8 p-6">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Personal details</h2>
        <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2"><span className="font-medium">Full name</span>
            <input name="fullName" required defaultValue={me.fullName ?? ""} className="input" /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Date of birth</span>
            <input name="dob" type="date" required defaultValue={me.dob ? me.dob.slice(0, 10) : ""} className="input" /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Nationality</span>
            <input name="nationality" defaultValue={me.nationality ?? ""} placeholder="e.g. Indian" className="input" /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Phone</span>
            <input name="phone" type="tel" defaultValue={me.phone ?? ""} className="input" /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-medium">Email</span>
            <input name="email" type="email" defaultValue={me.email ?? ""} className="input" /></label>
          <button disabled={saving} className="btn btn-primary mt-1 py-2.5 sm:col-span-2">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      {/* Documents */}
      <section data-reveal-css className="card mt-6 p-6">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Documents</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DocRow
            title="Resume / CV"
            hint="PDF or Word, ≤5 MB"
            present={!!me.resumeBlobUrl}
            viewHref={me.resumeBlobUrl ?? undefined}
            accept=".pdf,.doc,.docx"
            onUpload={uploadResume}
          />
          <DocRow
            title="Aadhaar card"
            hint="For verification · PDF/JPG/PNG, ≤5 MB"
            present={!!me.aadhaarBlobUrl}
            viewHref={me.aadhaarBlobUrl ? "/api/me/aadhaar" : undefined}
            accept=".pdf,.jpg,.jpeg,.png"
            onUpload={uploadAadhaar}
          />
        </div>
      </section>

      {msg && <p role="status" className="mt-4 text-sm text-[var(--muted)]">{msg}</p>}
    </main>
  );
}

type DocRowProps = {
  title: string; hint: string; present: boolean; viewHref?: string; accept: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function DocRow({ title, hint, present, viewHref, accept, onUpload }: DocRowProps) {
  return (
    <div className="rounded-[0.625rem] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <span className="badge" style={present ? { color: "var(--brand-600)", borderColor: "color-mix(in oklab, var(--brand) 35%, var(--border))" } : undefined}>
          {present ? "✓ Uploaded" : "Missing"}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
      <div className="mt-3 flex items-center gap-3">
        <label className="btn btn-ghost cursor-pointer px-3 py-1.5 text-sm">
          {present ? "Replace" : "Upload"}
          <input type="file" accept={accept} onChange={onUpload} className="hidden" />
        </label>
        {present && viewHref && (
          <a href={viewHref} target="_blank" rel="noreferrer" className="link text-sm">View</a>
        )}
      </div>
    </div>
  );
}
