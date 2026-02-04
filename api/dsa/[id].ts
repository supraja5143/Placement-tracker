import type { VercelResponse } from "@vercel/node";
import { withAuth, type AuthenticatedRequest } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { insertDsaTopicSchema } from "../../shared/schema";
import { z } from "zod";

const updateInput = insertDsaTopicSchema.partial().omit({ userId: true });

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== "PATCH") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const id = parseInt(req.query.id as string);
    const parsed = updateInput.parse(req.body);
    const topic = await storage.updateDsaTopic(id, req.user.userId, parsed);
    res.status(200).json(topic);
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json(e.errors);
    } else {
      throw e;
    }
  }
});
