import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken, type JwtPayload } from "./auth";

export interface AuthenticatedRequest extends VercelRequest {
  user: JwtPayload;
}

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;
type AuthHandler = (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void;

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

function extractToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
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
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    try {
      const payload = verifyToken(token);
      (req as AuthenticatedRequest).user = payload;
      await handler(req as AuthenticatedRequest, res);
    } catch {
      res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
  });
}
