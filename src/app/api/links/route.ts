import { NextResponse } from "next/server";
import { getActiveLinks } from "@/lib/db/queries/links";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const links = await getActiveLinks();
    return NextResponse.json({
      ok: true,
      links,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load links";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
