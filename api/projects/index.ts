import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withHandler } from "../_lib/middleware";
import { storage } from "../_lib/storage";
import { insertProjectSchema } from "../../shared/schema";
import { z } from "zod";

const createInput = insertProjectSchema.omit({ userId: true });
const updateInput = insertProjectSchema.partial().omit({ userId: true });
const DEFAULT_USER_ID = 1;

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const projectsList = await storage.getProjects(DEFAULT_USER_ID);
    res.status(200).json(projectsList);
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = createInput.parse(req.body);
      const project = await storage.createProject(DEFAULT_USER_ID, parsed);
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

  if (req.method === "PATCH") {
    try {
      const id = parseInt(req.query.id as string);
      const parsed = updateInput.parse(req.body);
      const project = await storage.updateProject(id, DEFAULT_USER_ID, parsed);
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
    const id = parseInt(req.query.id as string);
    await storage.deleteProject(id, DEFAULT_USER_ID);
    res.status(204).end();
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
});
