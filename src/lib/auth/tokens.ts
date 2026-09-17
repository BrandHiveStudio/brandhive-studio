import crypto from "crypto";

/**
 * Generates a cryptographically secure random token (32 bytes = 64 hex characters).
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes a SHA-256 hash of a token for safe database persistence.
 * The raw secret token is sent only in the verification/reset email link
 * and is never stored in plaintext in the database.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
