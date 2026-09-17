import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminSessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const SESSION_COOKIE_NAME = "bh_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  sessionId?: string;
}

function getSigningKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variable: ADMIN_JWT_SECRET");
    }
    return new TextEncoder().encode("brandhive-studio-admin-local-dev-key-change-in-production");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Signs a secure JWT token and persists active session in adminSessions for revocation tracking.
 */
export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_DURATION_SECONDS;
  const sessionId = payload.sessionId || `sess_${crypto.randomUUID()}`;

  // Persist session to adminSessions table
  try {
    await db.insert(adminSessions).values({
      id: sessionId,
      userId: payload.userId,
      tokenHash: sessionId,
      expiresAt: new Date(exp * 1000),
    });
  } catch (err) {
    console.warn("Could not persist session to adminSessions:", err);
  }

  return new SignJWT({ ...payload, sessionId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .setIssuer("brandhive-studio-admin")
    .setAudience("brandhive-admin")
    .sign(getSigningKey());
}

/**
 * Verifies and decodes an admin session token, validating against adminSessions revocation state.
 */
export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      issuer: "brandhive-studio-admin",
      audience: "brandhive-admin",
    });

    const sessionId = payload.sessionId as string | undefined;

    // If session ID is present, verify that it has not been revoked
    if (sessionId) {
      try {
        const sessionRecord = await db
          .select()
          .from(adminSessions)
          .where(
            and(
              eq(adminSessions.id, sessionId),
              eq(adminSessions.userId, payload.userId as string),
              gt(adminSessions.expiresAt, new Date())
            )
          )
          .limit(1);

        if (sessionRecord.length === 0) {
          // Session was revoked or expired in database
          return null;
        }
      } catch (dbErr) {
        // If DB temporarily unavailable, allow valid cryptographic JWT
        console.warn("DB session check fallback:", dbErr);
      }
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      sessionId,
    };
  } catch {
    return null;
  }
}

/**
 * Invalidates all active sessions for a specific admin user (used on password change / reset).
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  try {
    await db.delete(adminSessions).where(eq(adminSessions.userId, userId));
  } catch (err) {
    console.error("Failed to invalidate all user sessions:", err);
  }
}

/**
 * Invalidates a specific session ID (used on logout).
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  try {
    await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
  } catch (err) {
    console.error("Failed to invalidate session:", err);
  }
}

/**
 * Helper to retrieve the currently logged in admin from Next.js request cookies (Server Components / Route Handlers).
 */
export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}
