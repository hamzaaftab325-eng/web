/**
 * Diagnose the User table schema — find out what's wrong with the role column.
 */
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const db = new PrismaClient();

async function main() {
  // Check column type for User.role
  const columnInfo = await db.$queryRaw<Array<{
    column_name: string;
    data_type: string;
    udt_name: string;
    is_nullable: string;
  }>>`
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'User'
    ORDER BY ordinal_position
  `;

  console.log("=== User table columns ===");
  columnInfo.forEach((c) => {
    console.log(`  ${c.column_name.padEnd(20)} | ${c.data_type.padEnd(20)} | udt: ${c.udt_name} | nullable: ${c.is_nullable}`);
  });

  // Check for enum types in the DB
  const enumTypes = await db.$queryRaw<Array<{
    typname: string;
    enumlabel: string;
  }>>`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder
  `;

  console.log("\n=== Enum types in DB ===");
  if (enumTypes.length === 0) {
    console.log("  (no enum types found)");
  } else {
    enumTypes.forEach((e) => console.log(`  ${e.typname} = '${e.enumlabel}'`));
  }

  // Check existing users
  const users = await db.$queryRaw<Array<{
    id: string;
    email: string;
    role: unknown;
    "isActive": boolean;
  }>>`
    SELECT id, email, role, "isActive" FROM "User" LIMIT 10
  `;

  console.log("\n=== Existing users ===");
  if (users.length === 0) {
    console.log("  (no users found)");
  } else {
    users.forEach((u) => console.log(`  ${u.email} | role: ${JSON.stringify(u.role)} | isActive: ${u.isActive}`));
  }
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));
