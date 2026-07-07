/**
 * Create or reset the admin user — uses raw SQL to bypass Prisma client issues.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

function parseArg(name: string): string | undefined {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag?.split("=")[1];
}

const TARGET_EMAIL = parseArg("email") ?? "admin@auraliving.com";
const NEW_PASSWORD = parseArg("password");

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}

if (!NEW_PASSWORD) {
  console.error("✗ Password not provided.");
  console.error("  Usage: bun run scripts/create-admin.ts --password=\"YourPassword\"");
  process.exit(1);
}

if (NEW_PASSWORD.length < 8) {
  console.error("✗ Password must be at least 8 characters.");
  process.exit(1);
}

const db = new PrismaClient();

async function main() {
  console.log(`Looking for user with email: ${TARGET_EMAIL}...`);

  // Use raw SQL to avoid Prisma client type conversion issues
  const existing = await db.$queryRaw<Array<{ id: string; role: string; email: string }>>`
    SELECT id, role, email FROM "User" WHERE email = ${TARGET_EMAIL} LIMIT 1
  `;

  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);

  // Verify hash works before persisting
  const verifyOk = await bcrypt.compare(NEW_PASSWORD, passwordHash);
  if (!verifyOk) {
    console.error("✗ Hash verification failed. Aborting.");
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    const user = existing[0];
    console.log(`✓ User exists (current role: ${user.role}). Resetting password...`);

    await db.$executeRaw`
      UPDATE "User"
      SET "passwordHash" = ${passwordHash},
          role = 'admin',
          "isActive" = true,
          "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;

    // Invalidate all existing sessions
    const deletedSessions = await db.$executeRaw`
      DELETE FROM "UserSession" WHERE "userId" = ${user.id}
    `;
    console.log(`✓ Admin password reset.`);
    console.log(`  Email: ${TARGET_EMAIL}`);
    console.log(`  Sessions revoked: ${deletedSessions}`);
  } else {
    console.log(`✓ User does not exist. Creating new admin...`);

    // Generate a CUID-like ID (we'll use a random UUID)
    const { randomUUID } = await import("crypto");
    const userId = randomUUID();

    await db.$executeRaw`
      INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
      VALUES (${userId}, ${TARGET_EMAIL}, ${passwordHash}, 'Admin', 'User', 'admin', true, NOW(), NOW())
    `;

    // Create user preferences row (optional — skip if it fails, admin can still log in)
    try {
      await db.$executeRaw`
        INSERT INTO "UserPreferences" ("userId", newsletter, "newArrivals", "saleAlerts", "orderUpdates", "stylePreferences", "updatedAt")
        VALUES (${userId}, false, false, false, true, ARRAY[]::TEXT[], NOW())
      `;
      console.log(`  (UserPreferences row created)`);
    } catch (prefError) {
      console.log(`  (UserPreferences skipped: ${prefError instanceof Error ? prefError.message : "unknown"})`);
    }

    console.log(`✓ Admin user created.`);
    console.log(`  Email: ${TARGET_EMAIL}`);
  }

  console.log("");
  console.log("⚠ SECURITY WARNING: This script bypasses password strength validation.");
  console.log("  If your password is weak (no uppercase, no special char), please");
  console.log("  change it via /account after logging in.");
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));
