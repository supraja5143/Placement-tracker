import type { VercelResponse } from "@vercel/node";
import { withAuth, type AuthenticatedRequest } from "../_lib/middleware";
import { storage } from "../_lib/storage";

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const id = parseInt(req.query.id as string);
  await storage.deleteMockInterview(id, req.user.userId);
  res.status(204).end();
});
