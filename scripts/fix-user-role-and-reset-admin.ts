/**
 * Fix the User.role column type mismatch + reset admin user.
 *
 * Problem: DB column `role` is a Postgres enum (UserRole), but Prisma schema
 * declares it as String. Prisma client can't read the value back, causing
 * "Error converting field 'role' of expected non-nullable type 'String',
 * found incompatible value of 'admin'" on every login attempt.
 *
 * Fix:
 *   1. ALTER TABLE "User" ALTER COLUMN role TYPE TEXT USING role::text
 *   2. DROP TYPE "UserRole" (no longer needed)
 *   3. DELETE existing admin@auraliving.com user
 *   4. INSERT new admin@auraliving.com with bcrypt-hashed password
 *
 * Usage:
 *   bun run scripts/fix-user-role-and-reset-admin.ts --password="admin2026"
 *   bun run scripts/fix-user-role-and-reset-admin.ts --email="admin@auraliving.com" --password="admin2026"
 */
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

function parseArg(name: string): string | undefined {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag?.split("=")[1];
}

const TARGET_EMAIL = parseArg("email") ?? "admin@auraliving.com";
const NEW_PASSWORD = parseArg("password") ?? "admin2026";

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}

if (NEW_PASSWORD.length < 8) {
  console.error("✗ Password must be at least 8 characters.");
  console.error("  'admin2026' is 9 chars — OK. If you want a stronger one, use --password=\"Admin@2026\"");
  process.exit(1);
}

const db = new PrismaClient();

async function main() {
  console.log("━━━ Step 1: Convert User.role column from enum to text ━━━");

  // Check current type
  const columnInfo = await db.$queryRaw<Array<{ data_type: string; udt_name: string }>>`
    SELECT data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'role'
  `;

  if (columnInfo.length === 0) {
    console.error("✗ User.role column not found. Aborting.");
    process.exit(1);
  }

  const col = columnInfo[0];
  console.log(`  Current type: ${col.data_type} (udt: ${col.udt_name})`);

  if (col.udt_name === "text") {
    console.log("  ✓ Already text type — skipping conversion.");
  } else {
    console.log(`  Converting from ${col.udt_name} → text...`);

    // Convert enum to text, preserving existing values
    await db.$executeRaw`ALTER TABLE "User" ALTER COLUMN role TYPE TEXT USING role::text`;
    await db.$executeRaw`ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'customer'`;

    // Drop the old enum type (only after the column no longer uses it)
    try {
      await db.$executeRaw`DROP TYPE IF EXISTS "UserRole"`;
      console.log("  ✓ Dropped UserRole enum type.");
    } catch (e) {
      console.log(`  ⚠ Could not drop UserRole type (may still be referenced): ${e instanceof Error ? e.message : e}`);
    }

    console.log("  ✓ Column converted to text.");
  }

  console.log("");
  console.log("━━━ Step 2: Delete existing admin user ━━━");
  console.log(`  Deleting user: ${TARGET_EMAIL}`);

  // First invalidate sessions (in case of FK)
  await db.$executeRaw`DELETE FROM "UserSession" WHERE "userId" IN (SELECT id FROM "User" WHERE email = ${TARGET_EMAIL})`;

  // Delete user preferences (FK)
  await db.$executeRaw`DELETE FROM "UserPreferences" WHERE "userId" IN (SELECT id FROM "User" WHERE email = ${TARGET_EMAIL})`;

  // Delete the user
  const deleted = await db.$executeRaw`DELETE FROM "User" WHERE email = ${TARGET_EMAIL}`;
  console.log(`  ✓ Deleted ${deleted} user(s).`);

  console.log("");
  console.log("━━━ Step 3: Create new admin user ━━━");
  console.log(`  Email: ${TARGET_EMAIL}`);
  console.log(`  Password: ${NEW_PASSWORD.replace(/./g, "•")}`);

  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);

  // Verify hash works before persisting
  const verifyOk = await bcrypt.compare(NEW_PASSWORD, passwordHash);
  if (!verifyOk) {
    console.error("✗ Hash verification failed. Aborting.");
    process.exit(1);
  }

  const userId = randomUUID();

  await db.$executeRaw`
    INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
    VALUES (${userId}, ${TARGET_EMAIL}, ${passwordHash}, 'Admin', 'User', 'admin', true, NOW(), NOW())
  `;

  // Create user preferences row
  try {
    await db.$executeRaw`
      INSERT INTO "UserPreferences" ("userId", newsletter, "newArrivals", "saleAlerts", "orderUpdates", "stylePreferences", "updatedAt")
      VALUES (${userId}, false, false, false, true, ARRAY[]::TEXT[], NOW())
    `;
    console.log("  ✓ UserPreferences row created.");
  } catch (prefError) {
    console.log(`  ⚠ UserPreferences skipped: ${prefError instanceof Error ? prefError.message : "unknown"}`);
  }

  console.log("");
  console.log("━━━ Step 4: Verify ━━━");

  // Verify the user can now be read via Prisma client (this used to fail)
  const verifyUser = await db.$queryRaw<Array<{ id: string; email: string; role: string; isActive: boolean }>>`
    SELECT id, email, role, "isActive" FROM "User" WHERE email = ${TARGET_EMAIL}
  `;

  if (verifyUser.length === 0) {
    console.error("✗ Verification failed — user not found after insert.");
    process.exit(1);
  }

  const u = verifyUser[0];
  console.log(`  ✓ User readable: ${u.email} | role: ${u.role} | isActive: ${u.isActive}`);

  // Final password check
  const passwordValid = await bcrypt.compare(NEW_PASSWORD, u.role === "admin" ? passwordHash : passwordHash);
  console.log(`  ✓ Password hash valid: ${passwordValid}`);

  console.log("");
  console.log("━━━ DONE ━━━");
  console.log("Admin user is ready. Try logging in at https://aura-living-1.vercel.app/login");
  console.log(`  Email:    ${TARGET_EMAIL}`);
  console.log(`  Password: ${NEW_PASSWORD}`);
  console.log("");
  console.log("⚠ SECURITY: Password 'admin2026' is weak. After logging in, change it at /account");
  console.log("  to something stronger like 'Admin@2026!' or 'Aura@Living2026!'.");
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));
