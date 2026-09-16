import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getR2StorageStats } from "@/lib/storage/r2";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch live R2 stats
    const r2Stats = await getR2StorageStats(10); // 10 GB limit

    // 2. Cross-reference with Turso media metadata count & total recorded bytes
    const dbSummary = await db
      .select({
        dbCount: sql<number>`count(*)`,
        dbTotalBytes: sql<number>`sum(${media.sizeBytes})`,
      })
      .from(media);

    const dbCount = dbSummary[0]?.dbCount || 0;
    const dbTotalBytes = dbSummary[0]?.dbTotalBytes || 0;

    // Use R2 live bytes if available, else DB recorded bytes
    const effectiveUsedBytes = r2Stats.usedBytes > 0 ? r2Stats.usedBytes : dbTotalBytes;
    const effectiveObjectCount = r2Stats.totalObjects > 0 ? r2Stats.totalObjects : dbCount;

    return NextResponse.json({
      ok: true,
      stats: {
        ...r2Stats,
        usedBytes: effectiveUsedBytes,
        totalObjects: effectiveObjectCount,
        dbRecordedCount: dbCount,
        dbRecordedBytes: dbTotalBytes,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error calculating storage stats";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
