import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAllLinks, createLink } from "@/lib/db/queries/links";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || undefined;
    const search = searchParams.get("search") || undefined;
    const activeParam = searchParams.get("active");
    const isActive = activeParam !== null ? activeParam === "true" : undefined;

    const items = await getAllLinks({ search, platform, isActive });

    return NextResponse.json({
      ok: true,
      links: items,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch links";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { platform, label, url, displayOrder, isActive } = body;

    if (!platform || !platform.trim()) {
      return NextResponse.json({ error: "Platform identifier is required." }, { status: 400 });
    }

    if (!label || !label.trim()) {
      return NextResponse.json({ error: "Label is required." }, { status: 400 });
    }

    if (!url || !url.trim()) {
      return NextResponse.json({ error: "URL or contact target is required." }, { status: 400 });
    }

    const newLink = await createLink({
      platform: platform.trim(),
      label: label.trim(),
      url: url.trim(),
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({
      ok: true,
      link: newLink,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create link";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
