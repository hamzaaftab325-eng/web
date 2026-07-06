/**
 * Clean up test rows created during verification.
 */
import { db } from "../src/lib/db";

async function main() {
  const result = await db.rateLimitCounter.deleteMany({
    where: { key: { startsWith: "curl-test" } },
  });
  console.log(`✓ Deleted ${result.count} test rows.`);
}

main()
  .catch((error) => {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
