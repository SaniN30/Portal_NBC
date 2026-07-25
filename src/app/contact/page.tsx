import Link from "next/link";

const EMAIL = "neevbridgeconsultancy@gmail.com";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="link text-sm">← Home</Link>

      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">Get in touch</h1>
      <p className="mt-3 max-w-prose text-[var(--muted)]">
        Questions about a role or your application? Reach out and our team will get back to you.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${EMAIL}`}
          className="card group flex flex-col p-6 transition hover:border-[color-mix(in_oklab,var(--brand)_45%,var(--border))]"
        >
          <span className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">Email us</span>
          <span className="mt-2 font-medium text-[var(--brand-600)] group-hover:underline">{EMAIL}</span>
          <span className="mt-1 text-sm text-[var(--muted)]">We usually reply within a business day.</span>
        </a>

        <div className="card flex flex-col p-6">
          <span className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">Company</span>
          <span className="mt-2 font-medium">Neev Bridge Consultancy Manpower</span>
          <span className="mt-1 text-sm text-[var(--muted)]">Connecting engineers with the right employers.</span>
        </div>
      </div>

      <p className="mt-8 text-sm text-[var(--muted)]">
        Looking for open roles? <Link href="/listing" className="link">Browse positions →</Link>
      </p>
    </main>
  );
}
