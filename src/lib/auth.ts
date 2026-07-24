import { getSession, type Session } from "@/lib/session";

// Route guards. Throw a Response the caller catches, or return the session.
export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new AuthError(401, "Not signed in");
  return s;
}

export async function requireAdmin(): Promise<Session> {
  const s = await requireSession();
  if (s.role !== "admin") throw new AuthError(403, "Admins only");
  return s;
}
