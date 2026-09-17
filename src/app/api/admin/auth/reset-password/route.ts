import { NextResponse } from "next/server";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers, adminAuthTokens } from "@/lib/db/schema";
import { hashToken } from "@/lib/auth/tokens";
import { hashPassword, validatePasswordPolicy } from "@/lib/auth/password";
import { invalidateAllUserSessions, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation are required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const policyCheck = validatePasswordPolicy(newPassword);
    if (!policyCheck.valid) {
      return NextResponse.json(
        { error: policyCheck.errors[0], errors: policyCheck.errors },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);

    // Look up unused, non-expired reset token
    const tokenRecords = await db
      .select()
      .from(adminAuthTokens)
      .where(
        and(
          eq(adminAuthTokens.tokenHash, tokenHash),
          eq(adminAuthTokens.type, "password_reset"),
          isNull(adminAuthTokens.usedAt),
          gt(adminAuthTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (tokenRecords.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const tokenRecord = tokenRecords[0];

    // Hash the new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update the administrative user's credentials
    await db
      .update(adminUsers)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, tokenRecord.userId));

    // Mark token as single-use consumed
    await db
      .update(adminAuthTokens)
      .set({ usedAt: new Date() })
      .where(eq(adminAuthTokens.id, tokenRecord.id));

    // Invalidate all active admin sessions across all browsers
    await invalidateAllUserSessions(tokenRecord.userId);

    const response = NextResponse.json({
      ok: true,
      message: "Password reset successfully. Please log in with your new password.",
    });

    // Clear any active session cookie
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
