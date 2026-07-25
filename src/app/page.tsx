"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "../../public/logo.png";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FIELDS = ["Civil", "Mechanical", "Electrical", "Structural", "Piping", "QA/QC", "Instrumentation", "Project Mgmt"];

const STEPS = [
  { n: "01", t: "Build your profile", d: "Name, contact, nationality, resume and Aadhaar — verified and in one place." },
  { n: "02", t: "Browse live roles", d: "See only open engineering positions. Filter, read, and apply in one click." },
  { n: "03", t: "Track every application", d: "Follow each role from applied to shortlisted, right from your account." },
];

const STATS = [
  { v: 3, suffix: "", label: "steps to apply" },
  { v: 100, suffix: "%", label: "free for candidates" },
  { v: 24, suffix: "/7", label: "access to openings" },
];

export default function Home() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero: staggered rise. Only hidden when we actually animate.
      gsap.set(".hero-el", { opacity: 0, y: 26 });
      gsap.to(".hero-el", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.15 });

      // Bridge cable draws itself on load.
      const cable = root.current!.querySelector<SVGPathElement>(".bridge-cable");
      if (cable) {
        const len = cable.getTotalLength();
        gsap.fromTo(cable, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", delay: 0.4 });
      }

      // Scroll-reveal any [data-reveal] block.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.set(el, { opacity: 0, y: 30 });
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // Count-up stats.
      root.current!.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? "";
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: () => {
            const o = { v: 0 };
            gsap.to(o, { v: end, duration: 1.4, ease: "power2.out",
              onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } });
          },
        });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <main ref={root} className="w-full overflow-x-clip">
      {/* HERO */}
      <section className="relative isolate">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--brand)_16%,transparent),transparent_70%)]" />
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-8 text-center sm:pt-24">
          <span className="hero-el badge mx-auto w-fit border-[color-mix(in_oklab,var(--brand)_35%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_10%,transparent)] text-[var(--text)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" /> Connecting Vision · Building Solutions · Driving Growth
          </span>
          <h1 className="hero-el mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
            Engineering careers,<br /><span className="text-[var(--brand)]">bridged with precision.</span>
          </h1>
          <p className="hero-el mx-auto mt-5 max-w-xl text-lg text-[var(--muted)]">
            Neev Bridge Consultancy connects skilled engineers with the right employers.
            Build a profile, upload your CV, and apply to live openings in minutes.
          </p>
          <div className="hero-el mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/listing" className="btn btn-primary px-6 py-3">View open positions</Link>
            <Link href="/login" className="btn btn-ghost px-6 py-3">Sign in</Link>
          </div>

          {/* Animated bridge */}
          <div className="hero-el mx-auto mt-14 max-w-3xl">
            <svg viewBox="0 0 800 200" className="w-full" fill="none" aria-hidden>
              <path className="bridge-cable" d="M20 150 C 150 40, 230 40, 260 120 C 290 40, 370 40, 400 120 C 430 40, 510 40, 540 120 C 570 40, 650 40, 780 150"
                stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
              {/* towers */}
              <line x1="260" y1="40" x2="260" y2="175" stroke="var(--accent)" strokeWidth="4" />
              <line x1="540" y1="40" x2="540" y2="175" stroke="var(--accent)" strokeWidth="4" />
              {/* deck */}
              <line x1="20" y1="175" x2="780" y2="175" stroke="var(--accent)" strokeWidth="3" />
              {/* verticals */}
              {Array.from({ length: 25 }).map((_, i) => (
                <line key={i} x1={40 + i * 30} y1="150" x2={40 + i * 30} y2="175" stroke="color-mix(in oklab, var(--brand) 40%, transparent)" strokeWidth="1.5" />
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 data-reveal className="text-center font-display text-2xl font-semibold sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} data-reveal className="card p-6">
              <span className="font-display text-3xl font-bold text-[color-mix(in_oklab,var(--brand)_50%,var(--border))]">{s.n}</span>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-[var(--muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-14 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} data-reveal className="text-center">
              <div className="font-display text-4xl font-bold text-[var(--brand)] sm:text-5xl"
                data-count={s.v} data-suffix={s.suffix}>0{s.suffix}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FIELDS */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 data-reveal className="text-center font-display text-2xl font-semibold sm:text-3xl">Fields we place</h2>
        <div data-reveal className="mt-8 flex flex-wrap justify-center gap-2.5">
          {FIELDS.map((f) => (
            <span key={f} className="badge border-[var(--border)] px-3.5 py-1.5 text-sm text-[var(--text)]">{f}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div data-reveal className="overflow-hidden rounded-2xl bg-[var(--brand)] px-8 py-14 text-center text-[var(--brand-fg)]">
          <Image src={logo} alt="" aria-hidden className="mx-auto mb-5 h-14 w-14 object-contain brightness-0 invert" />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to build your next chapter?</h2>
          <p className="mx-auto mt-3 max-w-md text-[color-mix(in_oklab,var(--brand-fg)_80%,transparent)]">
            Create your profile and apply to live engineering roles today.
          </p>
          <Link href="/login" className="btn mt-7 bg-[var(--brand-fg)] px-7 py-3 font-semibold text-[var(--brand)] hover:opacity-90">
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}
