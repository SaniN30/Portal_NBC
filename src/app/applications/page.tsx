"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Status = "applied" | "reviewed" | "shortlisted" | "rejected";
type Application = {
  id: string; status: Status; appliedAt: string;
  job: { id: string; title: string; status: string };
};

const STATUS: Record<Status, { color: string; label: string }> = {
  applied: { color: "var(--muted)", label: "Applied" },
  reviewed: { color: "#2563eb", label: "Under review" },
  shortlisted: { color: "#16a34a", label: "Shortlisted" },
  rejected: { color: "#dc2626", label: "Not selected" },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Application[]>("/api/applications")
      .then(setApps)
      .catch((e) => {
        if ((e as Error).message === "Not signed in") { window.location.href = "/login?next=/applications"; return; }
        setMsg((e as Error).message);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { applied: 0, reviewed: 0, shortlisted: 0, rejected: 0 };
    apps.forEach((a) => { c[a.status]++; });
    return c;
  }, [apps]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">My applications</h1>
        <p className="mt-1 text-[var(--muted)]">Every role you&apos;ve applied to, and where it stands.</p>
      </header>

      {msg && <p role="status" className="mb-4 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm">{msg}</p>}

      {loading ? (
        <p className="text-[var(--muted)]">Loading…</p>
      ) : apps.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-medium">No applications yet.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Browse <Link href="/listing" className="link">open positions</Link> and apply in one click.
          </p>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="mb-6 grid grid-cols-4 gap-3">
            {(Object.keys(STATUS) as Status[]).map((s) => (
              <div key={s} className="card px-2 py-3 text-center">
                <div className="font-display text-2xl font-bold" style={{ color: STATUS[s].color }}>{counts[s]}</div>
                <div className="mt-0.5 text-[0.7rem] leading-tight text-[var(--muted)]">{STATUS[s].label}</div>
              </div>
            ))}
          </div>

          <ul className="flex flex-col gap-3">
            {apps.map((a) => (
              <li key={a.id} className="card flex items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATUS[a.status].color }} />
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{a.job.title}</h2>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Applied {new Date(a.appliedAt).toLocaleDateString()}
                      {a.job.status !== "live" && " · position closed"}
                    </p>
                  </div>
                </div>
                <span className="badge shrink-0" style={{ color: STATUS[a.status].color, borderColor: STATUS[a.status].color }}>
                  {STATUS[a.status].label}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
