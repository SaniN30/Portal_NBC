"use client";

// Tiny fetch helper: unwraps the { success, data, error } envelope.
// 20s abort so a stalled request surfaces an error instead of hanging the UI forever.
const TIMEOUT_MS = 20_000;

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    headers: init?.body && !(init.body instanceof FormData)
      ? { "Content-Type": "application/json", ...init?.headers }
      : init?.headers,
  }).catch((e: unknown) => {
    if (e instanceof DOMException && e.name === "TimeoutError") {
      throw new Error("The server took too long to respond. Please try again.");
    }
    throw new Error("Network error. Check your connection and try again.");
  });
  const json = await res.json().catch(() => ({ error: "Bad response" }));
  if (!json.success) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}
