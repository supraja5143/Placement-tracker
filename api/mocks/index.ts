import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { insertMockInterviewSchema } from "../../shared/schema";
import { z } from "zod";

const createInput = insertMockInterviewSchema.omit({ userId: true });
const DEFAULT_USER_ID = 1;

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const mocks = await storage.getMockInterviews(DEFAULT_USER_ID);
    res.status(200).json(mocks);
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = createInput.parse(req.body);
      const mock = await storage.createMockInterview(DEFAULT_USER_ID, parsed);
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

  if (req.method === "DELETE") {
    const id = parseInt(req.query.id as string);
    await storage.deleteMockInterview(id, DEFAULT_USER_ID);
    res.status(204).end();
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
});
