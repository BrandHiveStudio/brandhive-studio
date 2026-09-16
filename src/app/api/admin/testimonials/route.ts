import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.displayOrder));

    return NextResponse.json({
      ok: true,
      testimonials: records,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error fetching testimonials";
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
      clientName,
      company,
      role,
      review,
      logoUrl,
      avatarUrl,
      displayOrder,
      isPublished,
    } = body;

    if (!clientName || !company || !review) {
      return NextResponse.json(
        { error: "Client Name, Company, and Review text are required." },
        { status: 400 }
      );
    }

    const testimonialId = "testi_" + crypto.randomUUID();

    await db.insert(testimonials).values({
      id: testimonialId,
      clientName: clientName.trim(),
      company: company.trim(),
      role: role?.trim() || null,
      review: review.trim(),
      logoUrl: logoUrl?.trim() || null,
      avatarUrl: avatarUrl?.trim() || null,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    return NextResponse.json({
      ok: true,
      message: "Testimonial created successfully",
      testimonial: { id: testimonialId, clientName, company },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error creating testimonial";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
