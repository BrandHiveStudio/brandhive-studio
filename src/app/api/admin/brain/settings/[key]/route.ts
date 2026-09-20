import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  getBrainSettingByKey,
  upsertBrainSetting,
  deleteBrainSetting,
} from "@/lib/db/queries/brain";

interface RouteProps {
  params: Promise<{ key: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key } = await params;
    const cleanKey = key.trim().toLowerCase();
    const setting = await getBrainSettingByKey(cleanKey);
    if (!setting) {
      return NextResponse.json({ error: "Brain setting not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, setting });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Brain setting";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key } = await params;
    const cleanKey = key.trim().toLowerCase();
    const existing = await getBrainSettingByKey(cleanKey);
    if (!existing) {
      return NextResponse.json({ error: "Brain setting not found" }, { status: 404 });
    }

    const body = await request.json();
    const formattedValue =
      body.value !== undefined
        ? typeof body.value === "object"
          ? JSON.stringify(body.value)
          : String(body.value)
        : existing.value;

    const updated = await upsertBrainSetting({
      id: existing.id,
      key: cleanKey,
      value: formattedValue,
      description: body.description !== undefined ? String(body.description).trim() : existing.description,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
    });

    return NextResponse.json({ ok: true, setting: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update Brain setting";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key } = await params;
    const cleanKey = key.trim().toLowerCase();
    const existing = await getBrainSettingByKey(cleanKey);
    if (!existing) {
      return NextResponse.json({ error: "Brain setting not found" }, { status: 404 });
    }

    const success = await deleteBrainSetting(cleanKey);
    return NextResponse.json({ ok: success, message: "Brain setting deleted successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete Brain setting";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
