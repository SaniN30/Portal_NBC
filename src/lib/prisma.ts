import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Lazy singleton: only touches DATABASE_URL on first query, so importing a
// route during `next build` never crashes. Point DATABASE_URL at Neon's
// pooled string in prod (IdeaV2.md §11).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_t, prop) {
    const client = (globalForPrisma.prisma ??= makeClient());
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return Reflect.get(client, prop, client);
  },
});
