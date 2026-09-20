import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getBrainFaqs, createBrainFaq } from "@/lib/db/queries/brain";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const activeParam = searchParams.get("active");
    const isActive = activeParam !== null ? activeParam === "true" : undefined;

    const faqs = await getBrainFaqs({ category, search, isActive });
    return NextResponse.json({ ok: true, count: faqs.length, faqs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Brain FAQs";
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
    const { question, answer, category = "general", isActive = true, displayOrder = 0 } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Answer is required." }, { status: 400 });
    }

    const id = body.id || `bfaq_${crypto.randomUUID()}`;

    const created = await createBrainFaq({
      id,
      question: question.trim(),
      answer: answer.trim(),
      category: String(category).trim().toLowerCase(),
      isActive: Boolean(isActive),
      displayOrder: Number(displayOrder) || 0,
    });

    return NextResponse.json({ ok: true, faq: created }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create Brain FAQ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
