import type { VercelRequest, VercelResponse } from "@vercel/node";

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
