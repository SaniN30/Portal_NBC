import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">← Home</Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Contact us</h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-300">
        Questions about a role or your application? Reach out and our team will get back to you.
      </p>
      <dl className="mt-8 flex flex-col gap-4 text-sm">
        <div>
          <dt className="font-medium text-neutral-500">Email</dt>
          <dd><a href="mailto:neevbridgeconsultancy@gmail.com" className="text-blue-600 hover:underline">neevbridgeconsultancy@gmail.com</a></dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-500">Company</dt>
          <dd>Neev Bridge Consultancy Manpower</dd>
        </div>
      </dl>
    </main>
  );
}
