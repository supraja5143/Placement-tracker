import type { VercelRequest, VercelResponse } from "@vercel/node";
import pg from "pg";

const { Pool } = pg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.JWT_SECRET = process.env.JWT_SECRET ? "set" : "MISSING";
  checks.NODE_ENV = process.env.NODE_ENV || "not set";

  // Test DB connection directly (no _lib imports)
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });
    const result = await pool.query("SELECT 1 as ok");
    checks.db_connection = result.rows[0]?.ok === 1 ? "ok" : "unexpected";
    await pool.end();
  } catch (e: any) {
    checks.db_connection = `FAIL: ${e.message}`;
  }

  res.status(200).json(checks);
}
