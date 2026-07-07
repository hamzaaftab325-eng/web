/**
 * Reset admin password — prompts for a new password via CLI flag or env var.
 *
 * Usage:
 *   bun run scripts/reset-admin-password.ts --password="NewStrong@123"
 *   ADMIN_NEW_PASSWORD="..." bun run scripts/reset-admin-password.ts
 *   bun run scripts/reset-admin-password.ts --email="admin@auraliving.com" --password="..."
 *
 * Security:
 *   - NEVER hardcodes a password (the previous version had Aura@2026 baked in).
 *   - Validates password strength against the same rules as the signup flow.
 *   - Does NOT log the password to stdout (only the email is logged).
 *
 * Requires DATABASE_URL environment variable (loaded from .env.local).
 */
import bcrypt from "bcryptjs";
import { config } from "dotenv";

import { db } from "../src/lib/db";

config({ path: ".env.local" });

function parseArg(name: string): string | undefined {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`));
  return flag?.split("=")[1];
}

const TARGET_EMAIL = parseArg("email") ?? "admin@auraliving.com";
const NEW_PASSWORD = parseArg("password") ?? process.env.ADMIN_NEW_PASSWORD;

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set. Add it to .env.local and re-run.");
  process.exit(1);
}

if (!NEW_PASSWORD) {
  console.error("✗ New password not provided.");
  console.error("  Usage: bun run scripts/reset-admin-password.ts --password=\"NewStrong@123\"");
  console.error("     or: ADMIN_NEW_PASSWORD=\"...\" bun run scripts/reset-admin-password.ts");
  console.error("");
  console.error("  Password must be 8+ chars with uppercase, lowercase, digit, and special char.");
  process.exit(1);
}

function validatePasswordStrength(password: string): { ok: boolean; reason?: string } {
  if (password.length < 8) return { ok: false, reason: "at least 8 characters" };
  if (!/[A-Z]/.test(password)) return { ok: false, reason: "an uppercase letter" };
  if (!/[a-z]/.test(password)) return { ok: false, reason: "a lowercase letter" };
  if (!/[0-9]/.test(password)) return { ok: false, reason: "a digit" };
  if (!/[^A-Za-z0-9]/.test(password)) return { ok: false, reason: "a special character" };
  return { ok: true };
}

const strength = validatePasswordStrength(NEW_PASSWORD);
if (!strength.ok) {
  console.error(`✗ Password is too weak — must contain ${strength.reason}.`);
  process.exit(1);
}

async function main() {
  console.log(`Looking for admin user with email: ${TARGET_EMAIL}...`);

  const admin = await db.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!admin) {
    console.error(`✗ No user found with email: ${TARGET_EMAIL}`);
    console.error("  Use --email=\"...\" to target a different email.");
    process.exit(1);
  }

  if (admin.role !== "admin") {
    console.error(`✗ User ${TARGET_EMAIL} is not an admin (role: ${admin.role}).`);
    console.error("  Refusing to reset password for a non-admin account.");
    process.exit(1);
  }

  console.log(`✓ Admin user found: ${admin.email} (role: ${admin.role})`);

  const newHash = await bcrypt.hash(NEW_PASSWORD, 10);

  const verifyOk = await bcrypt.compare(NEW_PASSWORD, newHash);
  if (!verifyOk) {
    console.error("✗ Hash verification failed — bcrypt compare returned false. Aborting.");
    process.exit(1);
  }

  await db.user.update({
    where: { id: admin.id },
    data: { passwordHash: newHash, role: "admin", isActive: true },
  });

  const deletedSessions = await db.userSession.deleteMany({ where: { userId: admin.id } });

  console.log("");
  console.log("✓ Password updated successfully!");
  console.log(`  Email: ${admin.email}`);
  console.log("  Password: <not shown — keep it safe>");
  console.log(`  Sessions revoked: ${deletedSessions.count}`);
  console.log("");
  console.log("  The admin must now log in again on every device.");
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));
