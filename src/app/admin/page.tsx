"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Candidate = { id: string; fullName: string | null; email: string | null; phone: string | null; resumeBlobUrl: string | null; _count: { applications: number } };
type Admin = { id: string; email: string | null; fullName: string | null };
type Job = { id: string; title: string; status: string };

const field = "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900";
const btn = "rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900";

export default function AdminPage() {
  const [tab, setTab] = useState<"candidates" | "jobs" | "admins">("candidates");
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <Link href="/profile" className="text-sm text-neutral-500 hover:underline">Profile</Link>
      </header>
      <nav className="mb-6 flex gap-1 rounded-lg bg-neutral-100 p-1 text-sm dark:bg-neutral-800">
        {(["candidates", "jobs", "admins"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
            className={`flex-1 rounded-md py-2 capitalize ${tab === t ? "bg-white shadow-sm dark:bg-neutral-700" : "text-neutral-500"}`}>{t}</button>
        ))}
      </nav>
      {tab === "candidates" && <Candidates />}
      {tab === "jobs" && <Jobs />}
      {tab === "admins" && <Admins />}
    </main>
  );
}

function Candidates() {
  const [items, setItems] = useState<Candidate[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  const load = (c?: string) =>
    api<{ items: Candidate[]; nextCursor: string | null }>(`/api/admin/candidates${c ? `?cursor=${c}` : ""}`)
      .then((d) => { setItems((p) => c ? [...p, ...d.items] : d.items); setCursor(d.nextCursor); setMore(Boolean(d.nextCursor)); });
  useEffect(() => { load(); }, []);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-neutral-500"><tr>
          <th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Apps</th><th>Resume</th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-t border-neutral-200 dark:border-neutral-800">
              <td className="py-2">{c.fullName ?? "—"}</td><td>{c.email ?? "—"}</td><td>{c.phone ?? "—"}</td>
              <td>{c._count.applications}</td>
              <td>{c.resumeBlobUrl ? <a href={c.resumeBlobUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="py-4 text-neutral-500">No candidates yet.</p>}
      {more && <button onClick={() => load(cursor!)} className="mt-4 text-sm text-neutral-500 hover:underline">Load more</button>}
    </div>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [msg, setMsg] = useState("");
  const load = () => api<Job[]>("/api/jobs").then(setJobs);
  useEffect(() => { load(); }, []);
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg("");
    const f = new FormData(e.currentTarget);
    try {
      await api("/api/jobs", { method: "POST", body: JSON.stringify({
        title: f.get("title"), description: f.get("description"), location: f.get("location"), engineeringField: f.get("engineeringField") }) });
      (e.target as HTMLFormElement).reset(); load(); setMsg("Job posted.");
    } catch (e) { setMsg((e as Error).message); }
  }
  async function close(id: string) { await api(`/api/jobs/${id}`, { method: "DELETE" }); load(); }
  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={create} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-medium">Post a job</h2>
        <input name="title" required placeholder="Title" className={field} />
        <div className="flex gap-3">
          <input name="engineeringField" placeholder="Field (e.g. Civil)" className={`${field} flex-1`} />
          <input name="location" placeholder="Location" className={`${field} flex-1`} />
        </div>
        <textarea name="description" required placeholder="Description" rows={4} className={field} />
        <button className={btn + " self-start"}>Post</button>
      </form>
      <ul className="flex flex-col gap-2">
        {jobs.map((j) => (
          <li key={j.id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-800">
            <span>{j.title} <span className="text-neutral-400">({j.status})</span></span>
            {j.status === "live" && <button onClick={() => close(j.id)} className="text-red-600 hover:underline">Close</button>}
          </li>
        ))}
      </ul>
      {msg && <p role="status" className="text-sm text-neutral-500">{msg}</p>}
    </div>
  );
}

function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [msg, setMsg] = useState("");
  const load = () => api<Admin[]>("/api/admin/admins").then(setAdmins);
  useEffect(() => { load(); }, []);
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg("");
    const f = new FormData(e.currentTarget);
    try {
      await api("/api/admin/admins", { method: "POST", body: JSON.stringify({ email: f.get("email") }) });
      (e.target as HTMLFormElement).reset(); load(); setMsg("Admin added. They get admin access on next login.");
    } catch (e) { setMsg((e as Error).message); }
  }
  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={add} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-medium">Add an admin</h2>
        <div className="flex gap-3">
          <input name="email" type="email" required placeholder="email@example.com" className={`${field} flex-1`} />
          <button className={btn}>Add</button>
        </div>
      </form>
      <ul className="flex flex-col gap-2">
        {admins.map((a) => (
          <li key={a.id} className="rounded-lg border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-800">{a.email ?? a.fullName ?? a.id}</li>
        ))}
      </ul>
      {msg && <p role="status" className="text-sm text-neutral-500">{msg}</p>}
    </div>
  );
}
