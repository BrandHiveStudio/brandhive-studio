import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getInquiries, createInquiry } from "@/lib/db/queries/inquiries";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;

    const result = await getInquiries({
      status,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      ok: true,
      inquiries: result.inquiries,
      counts: result.counts,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch inquiries";
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
    const { name, email, phone, company, service, budget, message, status, notes } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      company: company ? String(company).trim() : null,
      service: service ? String(service).trim() : "Direct Lead",
      budget: budget ? String(budget).trim() : null,
      message: String(message).trim(),
      status: status || "new",
      notes: notes ? String(notes).trim() : null,
    });

    return NextResponse.json({
      ok: true,
      inquiry,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create inquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
