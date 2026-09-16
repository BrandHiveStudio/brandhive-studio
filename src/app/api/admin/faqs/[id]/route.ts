import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getFaqById, updateFaq, deleteFaq } from "@/lib/db/queries/faqs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await getFaqById(id);

    if (!item) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      faq: item,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch FAQ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getFaqById(id);

    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    const body = await request.json();
    const { question, answer, category, displayOrder, isPublished } = body;

    const updated = await updateFaq(id, {
      question: question !== undefined ? String(question).trim() : existing.question,
      answer: answer !== undefined ? String(answer).trim() : existing.answer,
      category: category !== undefined ? String(category).trim() : existing.category,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : existing.isPublished,
    });

    return NextResponse.json({
      ok: true,
      faq: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update FAQ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getFaqById(id);

    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await deleteFaq(id);

    return NextResponse.json({
      ok: true,
      message: "FAQ deleted successfully",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete FAQ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
