// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // ── Admin user ──────────────────────────────────────────────────────────────
  const hashed = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shop.ma" },
    update: { password: hashed, nom: "Admin Principal" },
    create: {
      email: "admin@shop.ma",
      password: hashed,
      nom: "Admin Principal",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin:", admin.email);

  console.log("\n🎉 Seed terminé !");
  console.log("   📧 Email    : admin@shop.ma");
  console.log("   🔑 Password : admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
