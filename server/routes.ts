import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingUser = await storage.getUserByUsername("demo");
  if (!existingUser) {
    const hashedPassword = await hashPassword("demo123");
    const user = await storage.createUser({
      username: "demo",
      password: hashedPassword
    });

    // Seed DSA
    await storage.createDsaTopic(user.id, { topic: "Two Sum", category: "Arrays", status: "completed" });
    await storage.createDsaTopic(user.id, { topic: "Reverse Linked List", category: "Linked List", status: "in_progress" });
    await storage.createDsaTopic(user.id, { topic: "Binary Search", category: "Arrays", status: "not_started" });

    // Seed CS
    await storage.createCsTopic(user.id, { subject: "OS", topic: "Process Scheduling", status: "completed" });
    await storage.createCsTopic(user.id, { subject: "DBMS", topic: "Normalization", status: "in_progress" });
    
    // Seed Projects
    await storage.createProject(user.id, { name: "Portfolio Website", techStack: "React, Tailwind", status: "completed", isInterviewReady: true });
    await storage.createProject(user.id, { name: "Task Manager", techStack: "Node, Express", status: "in_progress", isInterviewReady: false });
    
    // Seed Mocks
    await storage.createMockInterview(user.id, { date: new Date(), topicsCovered: "DSA, OS", selfRating: 8, feedback: "Good problem solving, work on communication." });
    
    // Seed Logs
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await storage.createDailyLog(user.id, { date: yesterday.toISOString(), content: "Solved 2 DSA problems", hoursSpent: 2 });
    await storage.createDailyLog(user.id, { date: new Date().toISOString(), content: "Revise OS concepts", hoursSpent: 1 });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  
  await seedDatabase();

  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // === DSA ROUTES ===
  app.get(api.dsa.list.path, requireAuth, async (req, res) => {
    const topics = await storage.getDsaTopics(req.user!.id);
    res.json(topics);
  });

  app.post(api.dsa.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.dsa.create.input.parse(req.body);
      const topic = await storage.createDsaTopic(req.user!.id, input);
      res.status(201).json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch(api.dsa.update.path, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.dsa.update.input.parse(req.body);
      const topic = await storage.updateDsaTopic(id, req.user!.id, input);
      res.json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  // === CS ROUTES ===
  app.get(api.cs.list.path, requireAuth, async (req, res) => {
    const topics = await storage.getCsTopics(req.user!.id);
    res.json(topics);
  });

  app.post(api.cs.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.cs.create.input.parse(req.body);
      const topic = await storage.createCsTopic(req.user!.id, input);
      res.status(201).json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch(api.cs.update.path, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.cs.update.input.parse(req.body);
      const topic = await storage.updateCsTopic(id, req.user!.id, input);
      res.json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  // === PROJECTS ROUTES ===
  app.get(api.projects.list.path, requireAuth, async (req, res) => {
    const projects = await storage.getProjects(req.user!.id);
    res.json(projects);
  });

  app.post(api.projects.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(req.user!.id, input);
      res.status(201).json(project);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch(api.projects.update.path, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(id, req.user!.id, input);
      res.json(project);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.delete(api.projects.delete.path, requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProject(id, req.user!.id);
    res.status(204).end();
  });

  // === MOCK INTERVIEWS ROUTES ===
  app.get(api.mocks.list.path, requireAuth, async (req, res) => {
    const mocks = await storage.getMockInterviews(req.user!.id);
    res.json(mocks);
  });

  app.post(api.mocks.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.mocks.create.input.parse(req.body);
      const mock = await storage.createMockInterview(req.user!.id, input);
      res.status(201).json(mock);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.delete(api.mocks.delete.path, requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteMockInterview(id, req.user!.id);
    res.status(204).end();
  });

  // === DAILY LOGS ROUTES ===
  app.get(api.logs.list.path, requireAuth, async (req, res) => {
    const logs = await storage.getDailyLogs(req.user!.id);
    res.json(logs);
  });

  app.post(api.logs.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createDailyLog(req.user!.id, input);
      res.status(201).json(log);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  return httpServer;
}
