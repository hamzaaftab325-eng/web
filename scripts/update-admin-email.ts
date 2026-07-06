/**
 * Update admin email — uses direct PrismaClient to bypass db.ts config issues.
 */
import { PrismaClient } from "@prisma/client";

// Force-set the env var directly (bypass any caching issues)
process.env.DATABASE_URL = "postgresql://postgres.stekfrfpwnxsczwjsrtc:Cobalt%21Tree%23981@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
process.env.DIRECT_URL = "postgresql://postgres.stekfrfpwnxsczwjsrtc:Cobalt%21Tree%23981@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

console.log("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 15) ?? "(not set)");

const db = new PrismaClient();

async function main() {
  console.log("Looking for admin user...");

  const before = await db.user.findFirst({
    where: { role: "admin" },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!before) {
    console.log("No admin user found!");
    return;
  }

  console.log("Found admin:", before);

  // Check if the target email already exists (from an old test account)
  const existing = await db.user.findFirst({
    where: { email: "hamzaaftab325@gmail.com" },
    select: { id: true, email: true, role: true, firstName: true },
  });

  if (existing) {
    console.log("Found existing user with target email:", existing);
    if (existing.role !== "admin") {
      // Delete the old non-admin account so we can update the admin's email
      console.log("Deleting old non-admin account to free up email...");
      await db.user.delete({ where: { id: existing.id } });
      console.log("✓ Deleted old account");
    } else {
      console.log("Admin already has this email!");
      return;
    }
  }

  const updated = await db.user.update({
    where: { id: before.id },
    data: { email: "hamzaaftab325@gmail.com" },
  });

  console.log("✓ Updated admin email:");
  console.log("  Old:", before.email);
  console.log("  New:", updated.email);
  console.log("  Name:", updated.firstName, updated.lastName);
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));
