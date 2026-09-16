import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAllFaqs, createFaq } from "@/lib/db/queries/faqs";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const items = await getAllFaqs({ category, search });

    return NextResponse.json({
      ok: true,
      faqs: items,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch FAQs";
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
    const { question, answer, category, displayOrder, isPublished } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    if (!answer || !answer.trim()) {
      return NextResponse.json({ error: "Answer is required." }, { status: 400 });
    }

    const faq = await createFaq({
      question: question.trim(),
      answer: answer.trim(),
      category: category?.trim() || "General",
      displayOrder: Number(displayOrder) || 0,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    return NextResponse.json({
      ok: true,
      faq,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create FAQ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
