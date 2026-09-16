import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAllSiteContent, getSiteContentMap, updateSiteContentBatch } from "@/lib/db/queries/content";
import type { ContentUpdateItem } from "@/lib/db/queries/content";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await getAllSiteContent();
    const map = await getSiteContentMap();

    return NextResponse.json({
      ok: true,
      items,
      map,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch site content";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let updatesToApply: ContentUpdateItem[] = [];

    if (Array.isArray(body.items)) {
      updatesToApply = body.items;
    } else if (body.updates && typeof body.updates === "object") {
      updatesToApply = Object.entries(body.updates).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    } else {
      return NextResponse.json(
        { error: "Invalid payload format. Expected 'items' array or 'updates' object." },
        { status: 400 }
      );
    }

    if (updatesToApply.length === 0) {
      return NextResponse.json({ error: "No items provided to update." }, { status: 400 });
    }

    await updateSiteContentBatch(updatesToApply);
    const updatedMap = await getSiteContentMap();

    return NextResponse.json({
      ok: true,
      message: `Successfully updated ${updatesToApply.length} content field(s).`,
      map: updatedMap,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update site content";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
