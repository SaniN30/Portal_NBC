import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data, error: null }, { status });

export const fail = (error: string, status = 400) =>
  NextResponse.json({ success: false, data: null, error }, { status });

// Maps thrown AuthError to a response; rethrows anything else.
export function onError(e: unknown) {
  if (e instanceof AuthError) return fail(e.message, e.status);
  console.error(e);
  return fail("Server error", 500);
}
