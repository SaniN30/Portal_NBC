"use client";

// Tiny fetch helper: unwraps the { success, data, error } envelope.
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body && !(init.body instanceof FormData)
      ? { "Content-Type": "application/json", ...init?.headers }
      : init?.headers,
  });
  const json = await res.json().catch(() => ({ error: "Bad response" }));
  if (!json.success) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}
