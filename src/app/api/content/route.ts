import { NextResponse } from "next/server";
import { getSiteContentMap } from "@/lib/db/queries/content";

export const revalidate = 60; // 1-minute caching for public queries

export async function GET() {
  try {
    const map = await getSiteContentMap();
    return NextResponse.json({
      ok: true,
      content: map,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch content";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
