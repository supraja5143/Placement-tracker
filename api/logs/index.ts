import type { VercelResponse } from "@vercel/node";
import { withAuth, type AuthenticatedRequest } from "../../server/middleware";
import { storage } from "../../server/storage";
import { insertDailyLogSchema } from "../../shared/schema";
import { z } from "zod";

const createInput = insertDailyLogSchema.omit({ userId: true });

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const userId = req.user.userId;

  if (req.method === "GET") {
    const logs = await storage.getDailyLogs(userId);
    res.status(200).json(logs);
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = createInput.parse(req.body);
      const log = await storage.createDailyLog(userId, parsed);
      res.status(201).json(log);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
});
