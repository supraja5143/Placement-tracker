import type { VercelResponse } from "@vercel/node";
import { withAuth, type AuthenticatedRequest } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { insertProjectSchema } from "../../shared/schema";
import { z } from "zod";

const createInput = insertProjectSchema.omit({ userId: true });

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const userId = req.user.userId;

  if (req.method === "GET") {
    const projectsList = await storage.getProjects(userId);
    res.status(200).json(projectsList);
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = createInput.parse(req.body);
      const project = await storage.createProject(userId, parsed);
      res.status(201).json(project);
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
