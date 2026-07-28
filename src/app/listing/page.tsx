"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Job = { id: string; title: string; description: string; location: string | null; engineeringField: string | null; duration: string | null; timeline: string | null; ctc: string | null };

export default function ListingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [field, setField] = useState<string>("All");
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    api<Job[]>("/api/jobs").then(setJobs).catch((e) => setMsg(e.message)).finally(() => setLoading(false));
  }, []);

  const fields = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.engineeringField).filter(Boolean) as string[])).sort()],
    [jobs],
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (field !== "All" && j.engineeringField !== field) return false;
      if (!needle) return true;
      return [j.title, j.engineeringField, j.location, j.duration, j.timeline, j.ctc, j.description]
        .some((v) => v?.toLowerCase().includes(needle));
    });
  }, [jobs, q, field]);

  async function apply(jobId: string) {
    setMsg("");
    try {
      await api("/api/applications", { method: "POST", body: JSON.stringify({ jobId }) });
      setApplied((s) => new Set(s).add(jobId));
    } catch (e) {
      if ((e as Error).message === "Not signed in") { window.location.href = "/login?next=/listing"; return; }
      setMsg((e as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Open positions</h1>
        <p className="mt-1 text-[var(--muted)]">Live engineering roles at Neev Bridge Consultancy.</p>
      </header>

      {/* Search + filter */}
      <div className="sticky top-16 z-10 -mx-2 mb-6 rounded-xl bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] px-2 py-2 backdrop-blur">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, field, or location…"
          aria-label="Search jobs"
          className="input w-full"
        />
        {fields.length > 2 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {fields.map((f) => (
              <button
                key={f}
                onClick={() => setField(f)}
                aria-pressed={field === f}
                className={`badge px-3 py-1.5 text-sm transition ${
                  field === f
                    ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_12%,transparent)] text-[var(--brand)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {msg && <p role="status" className="mb-4 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm">{msg}</p>}

      {loading ? (
        <p className="text-[var(--muted)]">Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-medium">No open positions right now.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Check back soon — new roles are posted weekly.</p>
        </div>
      ) : shown.length === 0 ? (
        <p className="text-[var(--muted)]">No roles match your search.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-[var(--muted)]">{shown.length} {shown.length === 1 ? "role" : "roles"}</p>
          <ul className="flex flex-col gap-4">
            {shown.map((j) => {
              const isApplied = applied.has(j.id);
              return (
                <li key={j.id} data-reveal-css className="card group p-5 transition hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--brand)_45%,var(--border))]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold">{j.title}</h2>
                      <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                        {j.engineeringField && <span className="badge border-[var(--border)]">{j.engineeringField}</span>}
                        {j.location && <span className="badge border-[var(--border)]">📍 {j.location}</span>}
                        {j.duration && <span className="badge border-[var(--border)]">⏱ {j.duration}</span>}
                        {j.timeline && <span className="badge border-[var(--border)]">🗓 {j.timeline}</span>}
                        {j.ctc && (
                          <span className="badge border-[color-mix(in_oklab,var(--brand)_35%,var(--border))] font-medium text-[var(--brand-600)]">
                            💰 {j.ctc}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => apply(j.id)}
                      disabled={isApplied}
                      className={`btn shrink-0 ${isApplied ? "btn-ghost" : "btn-primary"}`}
                    >
                      {isApplied ? "✓ Applied" : "Apply"}
                    </button>
                  </div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-[var(--muted)]">{j.description}</p>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        <Link href="/applications" className="link">Track your applications →</Link>
      </p>
    </main>
  );
}
