import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getCurrentAdmin, invalidateSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (currentAdmin?.sessionId) {
      await invalidateSession(currentAdmin.sessionId);
    }
  } catch (err) {
    console.warn("Could not invalidate session in DB during logout:", err);
  }

  const response = NextResponse.json({ ok: true, message: "Logged out successfully" });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
