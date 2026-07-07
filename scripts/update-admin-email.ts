/**
 * Update admin email — prompts for new email interactively.
 *
 * Usage:
 *   bun run scripts/update-admin-email.ts <new-email>
 *   or: ADMIN_EMAIL_TARGET=... bun run scripts/update-admin-email.ts
 *
 * Requires DATABASE_URL + DIRECT_URL environment variables (loaded from .env.local).
 * Never hardcodes credentials.
 */
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set. Add it to .env.local and re-run.");
  process.exit(1);
}

const db = new PrismaClient();

const TARGET_EMAIL = process.argv[2] ?? process.env.ADMIN_EMAIL_TARGET;

if (!TARGET_EMAIL) {
  console.error("✗ Target email not provided.");
  console.error("  Usage: bun run scripts/update-admin-email.ts <new-email>");
  console.error("     or: ADMIN_EMAIL_TARGET=... bun run scripts/update-admin-email.ts");
  process.exit(1);
}

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

  console.log("Found admin:", { id: before.id, email: before.email, name: `${before.firstName} ${before.lastName}` });

  const existing = await db.user.findFirst({
    where: { email: TARGET_EMAIL },
    select: { id: true, email: true, role: true, firstName: true },
  });

  if (existing) {
    console.log("Found existing user with target email:", existing);
    if (existing.role !== "admin") {
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
    data: { email: TARGET_EMAIL },
  });

  console.log("✓ Updated admin email:");
  console.log("  Old:", before.email);
  console.log("  New:", updated.email);
  console.log("  Name:", updated.firstName, updated.lastName);
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));
