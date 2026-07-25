"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import logoMark from "../../public/logo-mark.png";

const NAV = [
  { href: "/listing", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/contact", label: "Contact" },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") ?? "light";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
  }

  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid h-9 w-9 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
    >
      {/* Both icons rendered; cross-fade via opacity so there's no layout shift or hydration flash. */}
      <span className="relative block h-[18px] w-[18px]">
        <svg viewBox="0 0 24 24" fill="none" className={`absolute inset-0 transition-all duration-300 ${theme && isDark ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
        </svg>
        <svg viewBox="0 0 24 24" fill="currentColor" className={`absolute inset-0 transition-all duration-300 ${theme && !isDark ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      </span>
    </button>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4">
      <div className={`glass w-full max-w-3xl rounded-[1.4rem] transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}>
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <Image src={logoMark} alt="Neev Bridge Consultancy" priority className="h-7 w-auto sm:h-8" />
            <span className="font-display text-[1.02rem] font-semibold tracking-tight">Neev Bridge</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm sm:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3 py-2 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/profile" className="btn btn-primary hidden px-4 py-2 sm:inline-flex">My account</Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--text)] transition hover:bg-[var(--surface-2)] sm:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="flex flex-col gap-1 border-t border-[var(--border)] px-3 py-2 sm:hidden">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                {n.label}
              </Link>
            ))}
            <Link href="/profile" onClick={() => setOpen(false)} className="btn btn-primary mt-1 py-2.5">My account</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-6 py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <Image src={logoMark} alt="" aria-hidden className="h-6 w-auto opacity-90" />
          <p>© {new Date().getFullYear()} Neev Bridge Consultancy Manpower</p>
        </div>
        <nav className="flex gap-4">
          <Link href="/listing" className="link">Jobs</Link>
          <Link href="/contact" className="link">Contact</Link>
          <Link href="/login" className="link">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
