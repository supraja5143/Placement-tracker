import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.JWT_SECRET = process.env.JWT_SECRET ? "set" : "MISSING";
  checks.NODE_ENV = process.env.NODE_ENV || "not set";

  // Check module imports
  try {
    await import("./_lib/auth");
    checks.auth_module = "ok";
  } catch (e: any) {
    checks.auth_module = `FAIL: ${e.message}`;
  }

  try {
    await import("./_lib/db");
    checks.db_module = "ok";
  } catch (e: any) {
    checks.db_module = `FAIL: ${e.message}`;
  }

  try {
    await import("./_lib/storage");
    checks.storage_module = "ok";
  } catch (e: any) {
    checks.storage_module = `FAIL: ${e.message}`;
  }

  // Try a simple DB query
  try {
    const { getDb } = await import("./_lib/db");
    const db = getDb();
    await db.execute(new (await import("drizzle-orm")).sql`SELECT 1`);
    checks.db_connection = "ok";
  } catch (e: any) {
    checks.db_connection = `FAIL: ${e.message}`;
  }

  res.status(200).json(checks);
}
