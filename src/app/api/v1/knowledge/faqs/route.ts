import { NextResponse } from "next/server";
import { getPublishedFaqs } from "@/lib/db/queries/faqs";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/knowledge/faqs
 * Public read-only endpoint returning active, published FAQs
 * for website consumers and search.
 */
export async function GET() {

  try {
    const faqs = await getPublishedFaqs();
    return NextResponse.json({
      success: true,
      source: "BrandHive Studio CMS",
      count: faqs.length,
      data: faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        displayOrder: f.displayOrder,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch knowledge FAQs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve FAQs from knowledge base" },
      { status: 500 }
    );
  }
}
