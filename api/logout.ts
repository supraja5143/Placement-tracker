import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "./_lib/middleware";

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  // JWT is stateless — logout is handled client-side by deleting the token
  res.status(200).json({ message: "Logged out" });
});
