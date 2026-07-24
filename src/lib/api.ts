import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data, error: null }, { status });

export const fail = (error: string, status = 400) =>
  NextResponse.json({ success: false, data: null, error }, { status });
