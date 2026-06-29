import { db } from "../src/lib/db";

async function main() {
  try {
    const tables = await db.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    console.log("Tables in database:", tables.length);
    tables.forEach((t) => console.log("  -", t.tablename));

    const counts = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.order.count(),
      db.category.count(),
      db.collection.count(),
    ]);
    console.log("\nRow counts:");
    console.log("  Users:", counts[0]);
    console.log("  Products:", counts[1]);
    console.log("  Orders:", counts[2]);
    console.log("  Categories:", counts[3]);
    console.log("  Collections:", counts[4]);
  } catch (e) {
    console.error("ERROR:", e instanceof Error ? e.message : e);
  } finally {
    await db.$disconnect();
    process.exit(0);
  }
}
main();
