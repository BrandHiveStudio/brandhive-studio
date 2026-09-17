import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers, adminAuthTokens } from "@/lib/db/schema";
import { generateSecureToken, hashToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid administrator email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query administrative user
    const users = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, normalizedEmail))
      .limit(1);

    // If user exists, create secure single-use token and dispatch email
    if (users.length > 0) {
      const user = users[0];
      const rawToken = generateSecureToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

      // Invalidate any previously pending unused password reset tokens for this user
      await db
        .delete(adminAuthTokens)
        .where(
          and(
            eq(adminAuthTokens.userId, user.id),
            eq(adminAuthTokens.type, "password_reset")
          )
        );

      // Insert new token
      await db.insert(adminAuthTokens).values({
        id: `tok_${crypto.randomUUID()}`,
        userId: user.id,
        type: "password_reset",
        tokenHash,
        expiresAt,
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.brandhivestudio.com.lk";
      const resetUrl = `${baseUrl.replace(/\/$/, "")}/admin/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        adminName: user.name,
      });
    }

    // Always return an identical generic response to prevent email enumeration
    return NextResponse.json({
      ok: true,
      message:
        "If an administrative account exists for this email address, a password reset link has been dispatched.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
