import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { client, db } from "./index";
import { adminUsers } from "./schema";
import { hashPassword } from "../auth/password";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function seedAdmin() {
  console.log("🌱 Running Admin seed script...");

  const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@brandhivestudio.com.lk").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "BrandHiveAdmin2026!";
  const adminName = process.env.ADMIN_DEFAULT_NAME || "BrandHive Studio Administrator";

  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, adminEmail))
    .limit(1);

  if (existing.length > 0) {
    console.log(`ℹ️ Admin user (${adminEmail}) already exists in Turso database.`);
    return;
  }

  const hashedPassword = await hashPassword(adminPassword);
  const adminId = "admin_" + crypto.randomUUID();

  await db.insert(adminUsers).values({
    id: adminId,
    email: adminEmail,
    passwordHash: hashedPassword,
    name: adminName,
    role: "super_admin",
  });

  console.log(`✅ Default admin user successfully created:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Name:  ${adminName}`);
  console.log(`   Role:  super_admin`);
}

seedAdmin()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
