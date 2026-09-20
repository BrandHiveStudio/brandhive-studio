import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  getBrainFaqById,
  updateBrainFaq,
  deleteBrainFaq,
} from "@/lib/db/queries/brain";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const faq = await getBrainFaqById(id);
    if (!faq) {
      return NextResponse.json({ error: "Brain FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, faq });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Brain FAQ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getBrainFaqById(id);
    if (!existing) {
      return NextResponse.json({ error: "Brain FAQ not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.question !== undefined) {
      if (!body.question || typeof body.question !== "string" || !body.question.trim()) {
        return NextResponse.json({ error: "Question cannot be empty." }, { status: 400 });
      }
      updateData.question = body.question.trim();
    }

    if (body.answer !== undefined) {
      if (!body.answer || typeof body.answer !== "string" || !body.answer.trim()) {
        return NextResponse.json({ error: "Answer cannot be empty." }, { status: 400 });
      }
      updateData.answer = body.answer.trim();
    }

    if (body.category !== undefined) updateData.category = String(body.category).trim().toLowerCase();
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder) || 0;

    const updated = await updateBrainFaq(id, updateData);
    return NextResponse.json({ ok: true, faq: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update Brain FAQ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getBrainFaqById(id);
    if (!existing) {
      return NextResponse.json({ error: "Brain FAQ not found" }, { status: 404 });
    }

    const success = await deleteBrainFaq(id);
    return NextResponse.json({ ok: success, message: "Brain FAQ deleted successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete Brain FAQ";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
