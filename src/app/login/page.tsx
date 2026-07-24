"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Channel = "email" | "phone";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Something went wrong");
  return json.data;
}

function LoginForm() {
  const router = useRouter();
  const nextPath = useSearchParams().get("next") ?? "/profile";

  const [channel, setChannel] = useState<Channel>("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/auth/request-otp", { channel, identifier });
      setStep("verify");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/auth/verify-otp", { channel, identifier, code });
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Neev Bridge Consultancy</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to your account</p>
      </div>

      {step === "request" ? (
        <form onSubmit={requestCode} className="flex flex-col gap-4">
          <div className="flex rounded-lg bg-neutral-100 p-1 text-sm dark:bg-neutral-800">
            {(["email", "phone"] as Channel[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                aria-pressed={channel === c}
                className={`flex-1 rounded-md py-2 capitalize transition ${
                  channel === c ? "bg-white shadow-sm dark:bg-neutral-700" : "text-neutral-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{channel === "email" ? "Email address" : "Phone number"}</span>
            <input
              type={channel === "email" ? "email" : "tel"}
              inputMode={channel === "email" ? "email" : "tel"}
              autoComplete={channel === "email" ? "email" : "tel"}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={channel === "email" ? "you@example.com" : "+91 98765 43210"}
              className="input"
            />
          </label>

          <button
            disabled={busy}
            className="btn btn-primary w-full py-2.5"
          >
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-4">
          <p className="text-sm text-neutral-500">
            Enter the 6-digit code sent to <span className="font-medium text-neutral-900 dark:text-neutral-100">{identifier}</span>.
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="input text-center text-lg tracking-[0.5em]"
          />
          <button
            disabled={busy}
            className="btn btn-primary w-full py-2.5"
          >
            {busy ? "Verifying…" : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("request"); setCode(""); setError(""); }}
            className="text-sm text-neutral-500 hover:underline"
          >
            Use a different {channel}
          </button>
        </form>
      )}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
