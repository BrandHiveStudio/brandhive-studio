import { NextResponse } from "next/server";
import { getPublishedProcessSteps } from "@/lib/db/queries/process";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const steps = await getPublishedProcessSteps();
    return NextResponse.json({
      ok: true,
      steps,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load process steps";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
