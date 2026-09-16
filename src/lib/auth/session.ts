import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "bh_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
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
 * Signs a secure JWT token for the authenticated admin.
 */
export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_DURATION_SECONDS;

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .setIssuer("brandhive-studio-admin")
    .setAudience("brandhive-admin")
    .sign(getSigningKey());
}

/**
 * Verifies and decodes an admin session token.
 */
export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      issuer: "brandhive-studio-admin",
      audience: "brandhive-admin",
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
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
