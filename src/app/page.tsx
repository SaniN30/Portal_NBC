"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logoMark from "../../public/logo-mark.png";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FIELDS = ["Civil", "Mechanical", "Electrical", "Structural", "Piping", "QA / QC", "Instrumentation", "Project Management", "Geotechnical", "HVAC"];

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
  const spotlight = useRef<HTMLDivElement>(null);
  const bridge = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero: staggered rise from an already-styled default.
      gsap.set(".hero-el", { opacity: 0, y: 28 });
      gsap.to(".hero-el", { opacity: 1, y: 0, duration: 0.95, ease: "power3.out", stagger: 0.1, delay: 0.1 });

      // Bridge cable draws itself on load.
      const cable = root.current!.querySelector<SVGPathElement>(".bridge-cable");
      if (cable) {
        const len = cable.getTotalLength();
        gsap.fromTo(cable, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", delay: 0.5 });
      }

      // Bridge parallax on scroll.
      gsap.to(bridge.current, {
        yPercent: -12, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "40% top", scrub: 0.6 },
      });

      // Pointer spotlight + subtle bridge parallax follow.
      const onMove = (e: PointerEvent) => {
        const r = root.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(spotlight.current, { xPercent: x * 12, yPercent: y * 12, duration: 0.6, ease: "power2.out" });
        gsap.to(bridge.current, { x: x * -22, duration: 0.9, ease: "power2.out" });
      };
      window.addEventListener("pointermove", onMove);

      // Scroll reveals.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.set(el, { opacity: 0, y: 32 });
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.75, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // Timeline connector draws as the steps enter.
      const conn = root.current!.querySelector<SVGPathElement>(".step-connector");
      if (conn) {
        const len = conn.getTotalLength();
        gsap.fromTo(conn, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, ease: "none",
            scrollTrigger: { trigger: conn, start: "top 80%", end: "bottom 55%", scrub: 0.6 } });
      }

      // Count-up stats.
      root.current!.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? "";
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: () => {
            const o = { v: 0 };
            gsap.to(o, { v: end, duration: 1.5, ease: "power2.out",
              onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } });
          },
        });
      });

      return () => window.removeEventListener("pointermove", onMove);
    });

    return () => mm.revert();
  }, { scope: root });

  return (
    <main ref={root} className="w-full overflow-x-clip">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        {/* Interactive spotlight + grid texture */}
        <div ref={spotlight} aria-hidden className="pointer-events-none absolute -inset-40 -z-10 opacity-90"
          style={{ background: "radial-gradient(42% 42% at 50% 30%, color-mix(in oklab, var(--brand) 22%, transparent), transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
          style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(70% 55% at 50% 30%, #000, transparent 80%)", WebkitMaskImage: "radial-gradient(70% 55% at 50% 30%, #000, transparent 80%)" }} />

        <div className="mx-auto max-w-5xl px-6 pt-10 pb-6 text-center sm:pt-16">
          <span className="hero-el badge mx-auto w-fit border-[color-mix(in_oklab,var(--brand)_35%,var(--border))] bg-[color-mix(in_oklab,var(--brand)_10%,transparent)] text-[var(--text)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" /> Connecting Vision · Building Solutions · Driving Growth
          </span>
          <h1 className="hero-el mx-auto mt-7 max-w-3xl font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[4.4rem]">
            Engineering careers,<br />
            <span className="italic text-[var(--brand)]">bridged</span> with precision.
          </h1>
          <p className="hero-el mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
            Neev Bridge Consultancy connects skilled engineers with the right employers.
            Build a profile, upload your CV, and apply to live openings in minutes.
          </p>
          <div className="hero-el mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/listing" className="btn btn-primary px-6 py-3 text-base">View open positions</Link>
            <Link href="/login" className="btn btn-ghost px-6 py-3 text-base">Sign in</Link>
          </div>

          {/* Animated bridge */}
          <div ref={bridge} className="hero-el mx-auto mt-16 max-w-3xl will-change-transform">
            <svg viewBox="0 0 800 200" className="w-full" fill="none" aria-hidden>
              <path className="bridge-cable" d="M20 150 C 150 40, 230 40, 260 120 C 290 40, 370 40, 400 120 C 430 40, 510 40, 540 120 C 570 40, 650 40, 780 150"
                stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
              <line x1="260" y1="40" x2="260" y2="175" stroke="var(--accent)" strokeWidth="4" />
              <line x1="540" y1="40" x2="540" y2="175" stroke="var(--accent)" strokeWidth="4" />
              <line x1="20" y1="175" x2="780" y2="175" stroke="var(--accent)" strokeWidth="3" />
              {Array.from({ length: 25 }).map((_, i) => (
                <line key={i} x1={40 + i * 30} y1="150" x2={40 + i * 30} y2="175" stroke="color-mix(in oklab, var(--brand) 40%, transparent)" strokeWidth="1.5" />
              ))}
            </svg>
          </div>
        </div>

        {/* Fields marquee */}
        <div className="relative border-y border-[var(--border)] bg-[var(--surface-2)] py-3.5"
          style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
          <div className="marquee-track flex w-max gap-8 whitespace-nowrap text-sm font-medium text-[var(--muted)]">
            {[...FIELDS, ...FIELDS].map((f, i) => (
              <span key={i} className="flex items-center gap-8">{f}<span aria-hidden className="text-[var(--brand)]">◆</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — connected timeline */}
      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <h2 data-reveal className="text-center font-display text-3xl font-semibold sm:text-4xl">How it works</h2>
        <p data-reveal className="mx-auto mt-3 max-w-md text-center text-[var(--muted)]">Three steps from sign-up to a tracked application.</p>

        <div className="relative mt-14">
          {/* Vertical connector line that draws in on scroll */}
          <svg aria-hidden className="absolute left-[27px] top-2 h-[calc(100%-1rem)] w-2 sm:left-[31px]" viewBox="0 0 4 400" preserveAspectRatio="none" fill="none">
            <path className="step-connector" d="M2 0 V400" stroke="color-mix(in oklab, var(--brand) 55%, var(--border))" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 8" />
          </svg>
          <ol className="flex flex-col gap-10">
            {STEPS.map((s) => (
              <li key={s.n} data-reveal className="relative flex gap-6">
                <span className="z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--surface)] font-display text-lg font-semibold text-[var(--brand-600)] shadow-sm ring-1 ring-[color-mix(in_oklab,var(--brand)_30%,var(--border))]">
                  {s.n}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                  <p className="mt-1.5 text-[var(--muted)]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[var(--border)] bg-[var(--surface-2)]">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} data-reveal className="text-center">
              <div className="font-display text-5xl font-semibold text-[var(--brand)] sm:text-6xl"
                data-count={s.v} data-suffix={s.suffix}>0{s.suffix}</div>
              <div className="mt-2 text-sm text-[var(--muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div data-reveal className="relative overflow-hidden rounded-[1.75rem] bg-[#0b1c3f] px-8 py-16 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(50% 60% at 50% 0%, color-mix(in oklab, var(--brand) 60%, transparent), transparent 70%)" }} />
          <Image src={logoMark} alt="" aria-hidden className="relative mx-auto mb-6 h-12 w-auto brightness-0 invert" />
          <h2 className="relative font-display text-3xl font-semibold text-white sm:text-4xl">Ready to build your next chapter?</h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/70">
            Create your profile and apply to live engineering roles today.
          </p>
          <Link href="/login" className="btn relative mt-8 bg-white px-7 py-3 text-base font-semibold text-[#0b1c3f] hover:opacity-90">
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}
