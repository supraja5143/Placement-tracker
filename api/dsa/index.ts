import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { insertDsaTopicSchema } from "../../shared/schema";
import { z } from "zod";

const createInput = insertDsaTopicSchema.omit({ userId: true });
const updateInput = insertDsaTopicSchema.partial().omit({ userId: true });
const DEFAULT_USER_ID = 1;

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const topics = await storage.getDsaTopics(DEFAULT_USER_ID);
    res.status(200).json(topics);
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = createInput.parse(req.body);
      const topic = await storage.createDsaTopic(DEFAULT_USER_ID, parsed);
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
    try {
      const id = parseInt(req.query.id as string);
      const parsed = updateInput.parse(req.body);
      const topic = await storage.updateDsaTopic(id, DEFAULT_USER_ID, parsed);
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
