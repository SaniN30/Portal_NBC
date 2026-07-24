import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton to avoid exhausting connections during dev hot-reload / serverless.
// Uses the pg driver adapter — point DATABASE_URL at Neon's pooled string in prod (IdeaV2.md §11).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
