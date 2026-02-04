import type { VercelResponse } from "@vercel/node";
import { withAuth, type AuthenticatedRequest } from "./_lib/middleware";
import { storage } from "./_lib/storage";

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const user = await storage.getUser(req.user.userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ id: user.id, username: user.username });
});
