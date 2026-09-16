import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql/web";
import * as schema from "./schema";
import * as dotenv from "dotenv";

if (!process.env.TURSO_DATABASE_URL) {
  dotenv.config({ path: ".env.local" });
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.warn("⚠️ TURSO_DATABASE_URL is not set in environment variables.");
}

export const client = createClient({
  url: url || "file:local.db",
  authToken: authToken,
});

export const db = drizzle(client, { schema });

/**
 * Server-side database connectivity health check.
 * Safely validates connection to Turso without exposing credentials.
 */
export async function checkDbConnection(): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
  const start = Date.now();
  try {
    if (!url) {
      return { ok: false, message: "TURSO_DATABASE_URL is missing" };
    }
    const res = await client.execute("SELECT 1 as alive");
    const latencyMs = Date.now() - start;
    if (res.rows.length > 0) {
      return { ok: true, message: "Connected to Turso database (website-cmsadmin-data)", latencyMs };
    }
    return { ok: false, message: "Unexpected response from Turso database", latencyMs };
  } catch (error: unknown) {
    const latencyMs = Date.now() - start;
    const msg = error instanceof Error ? error.message : "Unknown database connection error";
    return { ok: false, message: msg, latencyMs };
  }
}
