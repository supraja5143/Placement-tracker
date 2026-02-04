import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "../_lib/middleware";
import { storage } from "../_lib/storage";

const DEFAULT_USER_ID = 1;

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const id = parseInt(req.query.id as string);
  await storage.deleteMockInterview(id, DEFAULT_USER_ID);
  res.status(204).end();
});
