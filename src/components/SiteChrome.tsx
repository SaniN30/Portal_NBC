import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_85%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand)] font-display text-sm font-bold text-[var(--brand-fg)]">NB</span>
          <span className="font-display text-[0.95rem] font-semibold tracking-tight">Neev Bridge</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/listing" className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">Jobs</Link>
          <Link href="/contact" className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">Contact</Link>
          <Link href="/profile" className="btn btn-primary ml-1 px-4 py-2">My account</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-6 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} Neev Bridge Consultancy Manpower</p>
        <nav className="flex gap-4">
          <Link href="/listing" className="link">Jobs</Link>
          <Link href="/contact" className="link">Contact</Link>
          <Link href="/login" className="link">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
