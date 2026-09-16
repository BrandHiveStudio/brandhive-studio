import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { checkDbConnection } from "@/lib/db";
import { checkR2Connection } from "@/lib/storage/r2";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dbStatus, r2Status] = await Promise.all([
    checkDbConnection(),
    checkR2Connection(),
  ]);

  return NextResponse.json({
    status: dbStatus.ok && r2Status.ok ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    database: {
      provider: "Turso (LibSQL)",
      database: "website-cmsadmin-data",
      ...dbStatus,
    },
    storage: {
      provider: "Cloudflare R2",
      bucket: process.env.R2_BUCKET_NAME || "configured",
      ...r2Status,
    },
  });
}
