import type { VercelResponse } from "@vercel/node";
import { withAuth, type AuthenticatedRequest } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { insertProjectSchema } from "../../shared/schema";
import { z } from "zod";

const updateInput = insertProjectSchema.partial().omit({ userId: true });

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const id = parseInt(req.query.id as string);
  const userId = req.user.userId;

  if (req.method === "PATCH") {
    try {
      const parsed = updateInput.parse(req.body);
      const project = await storage.updateProject(id, userId, parsed);
      res.status(200).json(project);
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
    await storage.deleteProject(id, userId);
    res.status(204).end();
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
});
