import { getSession, type Role, type Session } from "@/lib/session";

// Route guards. Throw a Response the caller catches, or return the session.
export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Linear RBAC: each role includes every capability of the ones below it.
// candidate < hiring_manager < recruiter < admin < super_admin.
export const ROLE_RANK: Record<Role, number> = {
  candidate: 0,
  hiring_manager: 1,
  recruiter: 2,
  admin: 3,
  super_admin: 4,
};

export function hasRole(role: Role, min: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

// Any non-candidate is staff (may enter /admin; sees all jobs).
export function isStaff(role: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK.hiring_manager;
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new AuthError(401, "Not signed in");
  return s;
}

export async function requireRole(min: Role): Promise<Session> {
  const s = await requireSession();
  if (!hasRole(s.role, min)) throw new AuthError(403, "Insufficient permissions");
  return s;
}

// Back-compat alias — "admin-level or above" (admin, super_admin).
export async function requireAdmin(): Promise<Session> {
  return requireRole("admin");
}

if (process.argv[1]?.endsWith("auth.ts")) {
  // ponytail: self-check, run with `tsx src/lib/auth.ts`
  console.assert(hasRole("super_admin", "admin"), "super_admin outranks admin");
  console.assert(!hasRole("recruiter", "admin"), "recruiter is below admin");
  console.assert(hasRole("recruiter", "hiring_manager"), "recruiter outranks hiring_manager");
  console.assert(!hasRole("hiring_manager", "recruiter"), "hiring_manager below recruiter");
  console.assert(isStaff("hiring_manager") && !isStaff("candidate"), "staff excludes candidate");
  console.log("auth.ts self-check passed");
}
