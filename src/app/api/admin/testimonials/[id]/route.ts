import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const records = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);

    if (records.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      testimonial: records[0],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
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

    const existing = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    await db
      .update(testimonials)
      .set({
        clientName: clientName.trim(),
        company: company.trim(),
        role: role?.trim() || null,
        review: review.trim(),
        logoUrl: logoUrl?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        updatedAt: new Date(),
      })
      .where(eq(testimonials.id, id));

    return NextResponse.json({
      ok: true,
      message: "Testimonial updated successfully",
      testimonial: { id, clientName, company },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
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
    const existing = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    await db.delete(testimonials).where(eq(testimonials.id, id));

    return NextResponse.json({
      ok: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
