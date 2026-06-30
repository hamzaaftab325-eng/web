import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  // Find the admin user
  const admin = await db.user.findUnique({ where: { email: "admin@auraliving.com" } });
  if (!admin) {
    console.log("Admin user not found!");
    return;
  }
  console.log("Admin user found:", admin.email, "role:", admin.role);
  console.log("Current hash:", admin.passwordHash);

  // Generate a new hash for Aura@2026
  const newPassword = "Aura@2026";
  const newHash = bcrypt.hashSync(newPassword, 10);
  console.log("New hash for", newPassword, ":", newHash);

  // Verify the new hash works
  console.log("Verification:", bcrypt.compareSync(newPassword, newHash));

  // Update the user
  await db.user.update({
    where: { id: admin.id },
    data: { passwordHash: newHash, role: "admin", isActive: true },
  });
  console.log("Password updated successfully!");
  console.log("");
  console.log("Admin credentials:");
  console.log("  Email: admin@auraliving.com");
  console.log("  Password: Aura@2026");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect().then(() => process.exit(0)));
