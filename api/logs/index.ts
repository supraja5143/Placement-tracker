import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { insertDailyLogSchema } from "../../shared/schema";
import { z } from "zod";

const createInput = insertDailyLogSchema.omit({ userId: true });
const DEFAULT_USER_ID = 1;

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const logs = await storage.getDailyLogs(DEFAULT_USER_ID);
    res.status(200).json(logs);
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = createInput.parse(req.body);
      const log = await storage.createDailyLog(DEFAULT_USER_ID, parsed);
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
