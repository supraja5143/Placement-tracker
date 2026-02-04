import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken, type JwtPayload } from "./auth";

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

export interface AuthenticatedRequest extends VercelRequest {
  user: JwtPayload;
}

type AuthHandler = (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void;

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

export function withHandler(handler: Handler): Handler {
  return async (req, res) => {
    if (handleCors(req, res)) return;
    try {
      await handler(req, res);
    } catch (error: any) {
      console.error("API Error:", error);
      const message = process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message || "Internal Server Error";
      res.status(500).json({ message });
    }
  };
}

export function withAuth(handler: AuthHandler): Handler {
  return withHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    try {
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      (req as AuthenticatedRequest).user = payload;
      await handler(req as AuthenticatedRequest, res);
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  });
}
