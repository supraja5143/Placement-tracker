import type { VercelResponse } from "@vercel/node";
import { withAuth, type AuthenticatedRequest } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { insertMockInterviewSchema } from "../../shared/schema";
import { z } from "zod";

const createInput = insertMockInterviewSchema.omit({ userId: true });

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const userId = req.user.userId;

  if (req.method === "GET") {
    const mocks = await storage.getMockInterviews(userId);
    res.status(200).json(mocks);
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = createInput.parse(req.body);
      const mock = await storage.createMockInterview(userId, parsed);
      res.status(201).json(mock);
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
