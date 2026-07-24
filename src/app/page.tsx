import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      <section className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="badge border-[color-mix(in_oklab,var(--accent)_45%,var(--border))] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--text)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> Neev Bridge Consultancy Manpower
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
            Engineering careers,<br /><span className="text-[var(--brand-600)]">matched with precision.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[var(--muted)]">
            We connect skilled engineers with the right employers. Create a profile,
            upload your CV, and apply to live openings in minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/listing" className="btn btn-primary px-6 py-3">View open positions</Link>
            <Link href="/login" className="btn btn-ghost px-6 py-3">Sign in</Link>
          </div>
        </div>
        <div className="card p-2">
          <div className="rounded-[calc(var(--radius)-0.3rem)] bg-[var(--surface-2)] p-6">
            <div className="flex flex-col gap-3">
              {[
                { k: "Live roles", v: "Updated weekly" },
                { k: "One-click apply", v: "With your saved CV" },
                { k: "Fields", v: "Civil · Mechanical · Electrical · more" },
              ].map((r) => (
                <div key={r.k} className="card flex items-center justify-between px-4 py-3.5">
                  <span className="font-medium">{r.k}</span>
                  <span className="text-sm text-[var(--muted)]">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-t border-[var(--border)] py-12 sm:grid-cols-3">
        {[
          { t: "Build your profile", d: "Full name, contact, DOB, and your resume — all in one place." },
          { t: "Browse live jobs", d: "See only open engineering roles and apply with a single click." },
          { t: "Track applications", d: "Follow every role you've applied to from your account." },
        ].map((f) => (
          <div key={f.t} className="card p-5">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="mt-1.5 text-sm text-[var(--muted)]">{f.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
