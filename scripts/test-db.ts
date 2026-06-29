import { db } from "../src/lib/db";

async function main() {
  const start = Date.now();
  console.log("connecting...");
  try {
    const result = await db.$queryRaw`SELECT 1 AS ok`;
    console.log("OK:", JSON.stringify(result), `(${Date.now() - start}ms)`);
    const userCount = await db.user.count();
    console.log("user count:", userCount);
  } catch (e) {
    console.error("ERROR:", e instanceof Error ? e.message : e);
  } finally {
    await db.$disconnect();
    process.exit(0);
  }
}
main();
