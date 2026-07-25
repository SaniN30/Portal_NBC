"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Application = {
  id: string;
  status: "applied" | "reviewed" | "shortlisted" | "rejected";
  appliedAt: string;
  job: { id: string; title: string; status: string };
};

const STATUS_COLOR: Record<Application["status"], string> = {
  applied: "",
  reviewed: "#2563eb",
  shortlisted: "#16a34a",
  rejected: "#dc2626",
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My applications</h1>
          <p className="text-sm text-neutral-500">Jobs you&apos;ve applied to at Neev Bridge Consultancy</p>
        </div>
        <Link href="/listing" className="text-sm text-neutral-500 hover:underline">Browse jobs</Link>
      </header>

      {msg && <p role="status" className="mb-4 rounded-lg bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">{msg}</p>}
      {loading ? <p className="text-neutral-500">Loading…</p> : apps.length === 0 ? (
        <p className="text-neutral-500">
          You haven&apos;t applied to anything yet. <Link href="/listing" className="underline">See open positions.</Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {apps.map((a) => (
            <li key={a.id} className="card flex items-start justify-between gap-4 p-5">
              <div>
                <h2 className="font-medium">{a.job.title}</h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Applied {new Date(a.appliedAt).toLocaleDateString()}
                  {a.job.status !== "live" && " · position closed"}
                </p>
              </div>
              <span className="badge shrink-0" style={STATUS_COLOR[a.status] ? { color: STATUS_COLOR[a.status], borderColor: STATUS_COLOR[a.status] } : undefined}>{a.status}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
