import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAllProcessSteps, createProcessStep } from "@/lib/db/queries/process";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const publishedParam = searchParams.get("published");
    const isPublished = publishedParam !== null ? publishedParam === "true" : undefined;

    const items = await getAllProcessSteps({ search, isPublished });

    return NextResponse.json({
      ok: true,
      steps: items,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch process steps";
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
    const {
      stepNumber,
      title,
      shortTitle,
      badge,
      shortDescription,
      description,
      icon,
      imageUrl,
      deliverables,
      displayOrder,
      isPublished,
    } = body;

    if (!stepNumber || !stepNumber.trim()) {
      return NextResponse.json({ error: "Step number is required (e.g. 01, 02)." }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Stage title is required." }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: "Stage description is required." }, { status: 400 });
    }

    let deliverablesStr = "[]";
    if (Array.isArray(deliverables)) {
      deliverablesStr = JSON.stringify(deliverables.map((d: string) => String(d).trim()).filter(Boolean));
    } else if (typeof deliverables === "string") {
      deliverablesStr = deliverables.trim();
    }

    const newStep = await createProcessStep({
      stepNumber: stepNumber.trim(),
      title: title.trim(),
      shortTitle: shortTitle?.trim() || title.trim(),
      badge: badge?.trim() || "WORKFLOW",
      shortDescription: shortDescription?.trim() || null,
      description: description.trim(),
      icon: icon?.trim() || "search",
      imageUrl: imageUrl?.trim() || null,
      deliverables: deliverablesStr,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    return NextResponse.json({
      ok: true,
      step: newStep,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create process step";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
