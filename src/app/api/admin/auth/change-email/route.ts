import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers, adminAuthTokens } from "@/lib/db/schema";
import { getCurrentAdmin } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { generateSecureToken, hashToken } from "@/lib/auth/tokens";
import { sendEmailVerificationEmail } from "@/lib/email/admin-auth";

export async function POST(request: Request) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newEmail } = body;

    if (!currentPassword || !newEmail || typeof newEmail !== "string") {
      return NextResponse.json(
        { error: "Current password and a valid new email address are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedNewEmail = newEmail.toLowerCase().trim();

    if (!emailRegex.test(normalizedNewEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (normalizedNewEmail === currentAdmin.email.toLowerCase().trim()) {
      return NextResponse.json(
        { error: "New email must be different from your current email address." },
        { status: 400 }
      );
    }

    // Lookup user to verify current password
    const users = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, currentAdmin.userId))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
    }

    const user = users[0];
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Check if new email is already registered to another admin
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, normalizedNewEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "The specified email address is already in use." },
        { status: 400 }
      );
    }

    // Invalidate existing pending email verification tokens for this user
    await db
      .delete(adminAuthTokens)
      .where(
        and(
          eq(adminAuthTokens.userId, user.id),
          eq(adminAuthTokens.type, "email_verification")
        )
      );

    // Generate single-use verification token (2 hours expiration)
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    await db.insert(adminAuthTokens).values({
      id: `tok_${crypto.randomUUID()}`,
      userId: user.id,
      type: "email_verification",
      tokenHash,
      metadata: JSON.stringify({ newEmail: normalizedNewEmail }),
      expiresAt,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.brandhivestudio.com.lk";
    const verifyUrl = `${baseUrl.replace(/\/$/, "")}/admin/verify-email?token=${rawToken}`;

    const dispatch = await sendEmailVerificationEmail({
      to: normalizedNewEmail,
      verifyUrl,
      adminName: user.name,
    });

    if (!dispatch.success) {
      return NextResponse.json(
        { error: dispatch.error || "Failed to dispatch verification email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `A verification link has been dispatched to ${normalizedNewEmail}. Please click the link to confirm and activate your new email.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
