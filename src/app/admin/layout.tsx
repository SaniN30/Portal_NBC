import type { Metadata } from "next";

// Console is not for search engines — keep it out of any index.
export const metadata: Metadata = {
  title: "Staff Console — Neev Bridge",
  robots: { index: false, follow: false, nocache: true },
};

// Distinct world from the candidate portal. The -mt cancels the root layout's
// header offset (SiteHeader/Footer are hidden on /admin) so the console owns
// the full viewport. ponytail: negative-margin cancel, revisit if root chrome
// padding changes.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-console -mt-20 min-h-dvh sm:-mt-24">
      <div className="admin-bar sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-6 w-6 place-items-center rounded bg-[var(--brand)] text-[0.7rem] font-bold text-[var(--brand-fg)]">N</span>
            <span className="admin-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Neev&nbsp;Bridge / <span className="text-[var(--text)]">Staff&nbsp;Console</span>
            </span>
          </div>
          <span className="admin-mono hidden text-[0.7rem] uppercase tracking-widest text-[var(--muted)] sm:inline">restricted</span>
        </div>
      </div>
      {children}
    </div>
  );
}
