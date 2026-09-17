import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getCurrentAdmin, invalidateAllUserSessions, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { verifyPassword, hashPassword, validatePasswordPolicy } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Current password, new password, and confirmation are required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
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

    // Lookup administrative user to verify current password
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

    // Hash new password and update in database
    const newHash = await hashPassword(newPassword);

    await db
      .update(adminUsers)
      .set({
        passwordHash: newHash,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, user.id));

    // Invalidate all existing admin sessions across all devices
    await invalidateAllUserSessions(user.id);

    const response = NextResponse.json({
      ok: true,
      message: "Password changed successfully. Please log in again with your new password.",
    });

    // Clear session cookie to require re-login
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
