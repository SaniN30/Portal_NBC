"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Job = { id: string; title: string; description: string; location: string | null; engineeringField: string | null };

export default function ListingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Job[]>("/api/jobs").then(setJobs).catch((e) => setMsg(e.message)).finally(() => setLoading(false));
  }, []);

  async function apply(jobId: string) {
    setMsg("");
    try {
      await api("/api/applications", { method: "POST", body: JSON.stringify({ jobId }) });
      setMsg("Applied! View it on your profile.");
    } catch (e) {
      if ((e as Error).message === "Not signed in") { window.location.href = "/login?next=/listing"; return; }
      setMsg((e as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Open positions</h1>
          <p className="text-sm text-neutral-500">Engineering roles at Neev Bridge Consultancy</p>
        </div>
        <Link href="/profile" className="text-sm text-neutral-500 hover:underline">My profile</Link>
      </header>

      {msg && <p role="status" className="mb-4 rounded-lg bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">{msg}</p>}
      {loading ? <p className="text-neutral-500">Loading…</p> : jobs.length === 0 ? (
        <p className="text-neutral-500">No open positions right now. Check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{j.title}</h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {[j.engineeringField, j.location].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <button onClick={() => apply(j.id)}
                  className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900">
                  Apply
                </button>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">{j.description}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
