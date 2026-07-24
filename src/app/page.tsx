import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">Neev Bridge Consultancy Manpower</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Engineering careers, matched with the right people.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-neutral-600 dark:text-neutral-300">
        We connect skilled engineers with employers across the industry. Create a profile,
        upload your CV, and apply to live openings in minutes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/listing" className="rounded-lg bg-neutral-900 px-5 py-3 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900">
          View open positions
        </Link>
        <Link href="/login" className="rounded-lg border border-neutral-300 px-5 py-3 font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
          Sign in
        </Link>
      </div>
      <nav className="mt-16 flex gap-6 text-sm text-neutral-500">
        <Link href="/listing" className="hover:underline">Jobs</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
        <Link href="/profile" className="hover:underline">My account</Link>
      </nav>
    </main>
  );
}
