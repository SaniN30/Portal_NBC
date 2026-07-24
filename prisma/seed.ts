import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  if (!email) throw new Error("Set SEED_ADMIN_EMAIL to seed the admin user.");

  await prisma.user.upsert({
    where: { email },
    update: { role: "admin" },
    create: { email, role: "admin", fullName: "NBC Admin", emailVerified: true },
  });
  console.log(`Seeded admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
