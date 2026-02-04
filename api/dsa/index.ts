import type { VercelResponse } from "@vercel/node";
import { withAuth, type AuthenticatedRequest } from "../../server/middleware";
import { storage } from "../../server/storage";
import { insertDsaTopicSchema } from "../../shared/schema";
import { z } from "zod";

const createInput = insertDsaTopicSchema.omit({ userId: true });
const updateInput = insertDsaTopicSchema.partial().omit({ userId: true });

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const userId = req.user.userId;

  if (req.method === "GET") {
    const topics = await storage.getDsaTopics(userId);
    res.status(200).json(topics);
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = createInput.parse(req.body);
      const topic = await storage.createDsaTopic(userId, parsed);
      res.status(201).json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
    return;
  }

  if (req.method === "PATCH") {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    try {
      const parsed = updateInput.parse(req.body);
      const topic = await storage.updateDsaTopic(id, userId, parsed);
      res.status(200).json(topic);
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
