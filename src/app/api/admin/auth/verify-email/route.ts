import { NextResponse } from "next/server";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers, adminAuthTokens } from "@/lib/db/schema";
import { hashToken } from "@/lib/auth/tokens";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Verification token is required." },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);

    // Look up unused, non-expired verification token
    const records = await db
      .select()
      .from(adminAuthTokens)
      .where(
        and(
          eq(adminAuthTokens.tokenHash, tokenHash),
          eq(adminAuthTokens.type, "email_verification"),
          isNull(adminAuthTokens.usedAt),
          gt(adminAuthTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (records.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired email verification link." },
        { status: 400 }
      );
    }

    const tokenRecord = records[0];
    let newEmail = "";

    try {
      const parsed = JSON.parse(tokenRecord.metadata || "{}");
      newEmail = parsed.newEmail;
    } catch {
      return NextResponse.json(
        { error: "Invalid verification token metadata." },
        { status: 400 }
      );
    }

    if (!newEmail || typeof newEmail !== "string") {
      return NextResponse.json(
        { error: "Target email address missing in token." },
        { status: 400 }
      );
    }

    // Double check email isn't taken by another user
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, newEmail))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== tokenRecord.userId) {
      return NextResponse.json(
        { error: "This email address was recently registered to another account." },
        { status: 400 }
      );
    }

    // Apply the new email address
    await db
      .update(adminUsers)
      .set({
        email: newEmail,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, tokenRecord.userId));

    // Mark token consumed
    await db
      .update(adminAuthTokens)
      .set({ usedAt: new Date() })
      .where(eq(adminAuthTokens.id, tokenRecord.id));

    return NextResponse.json({
      ok: true,
      email: newEmail,
      message: "Administrative email updated successfully. You can now use your new email address.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
