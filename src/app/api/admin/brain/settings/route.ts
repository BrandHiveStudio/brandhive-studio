import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getBrainSettings, upsertBrainSetting } from "@/lib/db/queries/brain";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get("active");
    const isActive = activeParam !== null ? activeParam === "true" : undefined;

    const settings = await getBrainSettings({ isActive });
    return NextResponse.json({ ok: true, count: settings.length, settings });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Brain settings";
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
    const { key, value, description, isActive = true } = body;

    if (!key || typeof key !== "string" || !key.trim()) {
      return NextResponse.json({ error: "Setting key is required." }, { status: 400 });
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ error: "Setting value is required." }, { status: 400 });
    }

    const formattedValue = typeof value === "object" ? JSON.stringify(value) : String(value);
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const id = body.id || `bset_${crypto.randomUUID()}`;

    const saved = await upsertBrainSetting({
      id,
      key: cleanKey,
      value: formattedValue,
      description: description ? String(description).trim() : null,
      isActive: Boolean(isActive),
    });

    return NextResponse.json({ ok: true, setting: saved }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save Brain setting";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
