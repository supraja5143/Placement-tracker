import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc } from "drizzle-orm";
import pg from "pg";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// ============================================================
// SCHEMA
// ============================================================

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

const dsaTopics = pgTable("dsa_topics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topic: text("topic").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("not_started"),
});

const csTopics = pgTable("cs_topics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("not_started"),
});

const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  techStack: text("tech_stack").notNull(),
  status: text("status").notNull().default("planned"),
  isInterviewReady: boolean("is_interview_ready").default(false),
});

const mockInterviews = pgTable("mock_interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  topicsCovered: text("topics_covered").notNull(),
  selfRating: integer("self_rating").notNull(),
  feedback: text("feedback"),
});

const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull().defaultNow(),
  content: text("content").notNull(),
  hoursSpent: integer("hours_spent").notNull(),
});

const insertDsaTopicSchema = createInsertSchema(dsaTopics).omit({ id: true });
const insertCsTopicSchema = createInsertSchema(csTopics).omit({ id: true });
const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
const insertMockInterviewSchema = createInsertSchema(mockInterviews).omit({ id: true });
const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({ id: true });

const schema = { users, dsaTopics, csTopics, projects, mockInterviews, dailyLogs };

type User = typeof users.$inferSelect;

// ============================================================
// DATABASE
// ============================================================

const { Pool } = pg;
let pool: pg.Pool | undefined;

function getPool(): pg.Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set.");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DATABASE_URL?.includes("localhost")
        ? undefined
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

let drizzleInstance: ReturnType<typeof drizzle> | undefined;

function getDb() {
  if (!drizzleInstance) {
    drizzleInstance = drizzle(getPool(), { schema });
  }
  return drizzleInstance;
}

// ============================================================
// AUTH UTILITIES
// ============================================================

const scryptAsync = promisify(scrypt);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production");
    }
    return "dev-only-secret-do-not-use-in-production";
  }
  return secret;
}

const JWT_EXPIRES_IN = "7d";

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashed, "hex");
  const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

interface JwtPayload {
  userId: number;
  username: string;
}

function signToken(user: User): string {
  const payload: JwtPayload = { userId: user.id, username: user.username };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

// ============================================================
// CORS
// ============================================================

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

// ============================================================
// AUTH MIDDLEWARE HELPER
// ============================================================

function getAuthUser(req: VercelRequest): JwtPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return verifyToken(authHeader.slice(7));
  } catch {
    return null;
  }
}

// ============================================================
// ROUTE HANDLERS
// ============================================================

async function handleAuth(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const authInput = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(50),
    password: z.string().min(6, "Password must be at least 6 characters").max(128),
  });

  const action = req.query.action as string;

  if (action === "login") {
    const result = authInput.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.errors[0].message });
      return;
    }
    const { username, password } = result.data;
    const [user] = await getDb().select().from(users).where(eq(users.username, username));
    if (!user || !(await comparePasswords(password, user.password))) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }
    const token = signToken(user);
    res.status(200).json({ token, user: { id: user.id, username: user.username } });
  } else if (action === "register") {
    const result = authInput.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: result.error.errors[0].message });
      return;
    }
    const { username, password } = result.data;
    const [existingUser] = await getDb().select().from(users).where(eq(users.username, username));
    if (existingUser) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }
    const hashedPassword = await hashPassword(password);
    const [user] = await getDb().insert(users).values({ username, password: hashedPassword }).returning();
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, username: user.username } });
  } else if (action === "logout") {
    res.status(200).json({ message: "Logged out" });
  } else {
    res.status(400).json({ message: "Invalid action. Use ?action=login|register|logout" });
  }
}

async function handleUser(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
  const authUser = getAuthUser(req);
  if (!authUser) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  const [user] = await getDb().select().from(users).where(eq(users.id, authUser.userId));
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.status(200).json({ id: user.id, username: user.username });
}

async function handleDsa(req: VercelRequest, res: VercelResponse) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  const userId = authUser.userId;

  if (req.method === "GET") {
    const topics = await getDb().select().from(dsaTopics).where(eq(dsaTopics.userId, userId));
    res.status(200).json(topics);
    return;
  }

  if (req.method === "POST") {
    const createInput = insertDsaTopicSchema.omit({ userId: true });
    try {
      const parsed = createInput.parse(req.body);
      const [topic] = await getDb().insert(dsaTopics).values({ ...parsed, userId }).returning();
      res.status(201).json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) { res.status(400).json(e.errors); } else { throw e; }
    }
    return;
  }

  if (req.method === "PATCH") {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) { res.status(400).json({ message: "Invalid ID" }); return; }
    const updateInput = insertDsaTopicSchema.partial().omit({ userId: true });
    try {
      const parsed = updateInput.parse(req.body);
      const [topic] = await getDb().update(dsaTopics).set(parsed).where(and(eq(dsaTopics.id, id), eq(dsaTopics.userId, userId))).returning();
      res.status(200).json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) { res.status(400).json(e.errors); } else { throw e; }
    }
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}

async function handleCs(req: VercelRequest, res: VercelResponse) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  const userId = authUser.userId;

  if (req.method === "GET") {
    const topics = await getDb().select().from(csTopics).where(eq(csTopics.userId, userId));
    res.status(200).json(topics);
    return;
  }

  if (req.method === "POST") {
    const createInput = insertCsTopicSchema.omit({ userId: true });
    try {
      const parsed = createInput.parse(req.body);
      const [topic] = await getDb().insert(csTopics).values({ ...parsed, userId }).returning();
      res.status(201).json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) { res.status(400).json(e.errors); } else { throw e; }
    }
    return;
  }

  if (req.method === "PATCH") {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) { res.status(400).json({ message: "Invalid ID" }); return; }
    const updateInput = insertCsTopicSchema.partial().omit({ userId: true });
    try {
      const parsed = updateInput.parse(req.body);
      const [topic] = await getDb().update(csTopics).set(parsed).where(and(eq(csTopics.id, id), eq(csTopics.userId, userId))).returning();
      res.status(200).json(topic);
    } catch (e) {
      if (e instanceof z.ZodError) { res.status(400).json(e.errors); } else { throw e; }
    }
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}

async function handleProjects(req: VercelRequest, res: VercelResponse) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  const userId = authUser.userId;

  if (req.method === "GET") {
    const list = await getDb().select().from(projects).where(eq(projects.userId, userId));
    res.status(200).json(list);
    return;
  }

  if (req.method === "POST") {
    const createInput = insertProjectSchema.omit({ userId: true });
    try {
      const parsed = createInput.parse(req.body);
      const [project] = await getDb().insert(projects).values({ ...parsed, userId }).returning();
      res.status(201).json(project);
    } catch (e) {
      if (e instanceof z.ZodError) { res.status(400).json(e.errors); } else { throw e; }
    }
    return;
  }

  if (req.method === "PATCH") {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) { res.status(400).json({ message: "Invalid ID" }); return; }
    const updateInput = insertProjectSchema.partial().omit({ userId: true });
    try {
      const parsed = updateInput.parse(req.body);
      const [project] = await getDb().update(projects).set(parsed).where(and(eq(projects.id, id), eq(projects.userId, userId))).returning();
      res.status(200).json(project);
    } catch (e) {
      if (e instanceof z.ZodError) { res.status(400).json(e.errors); } else { throw e; }
    }
    return;
  }

  if (req.method === "DELETE") {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) { res.status(400).json({ message: "Invalid ID" }); return; }
    await getDb().delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
    res.status(204).end();
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}

async function handleMocks(req: VercelRequest, res: VercelResponse) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  const userId = authUser.userId;

  if (req.method === "GET") {
    const list = await getDb().select().from(mockInterviews).where(eq(mockInterviews.userId, userId)).orderBy(desc(mockInterviews.date));
    res.status(200).json(list);
    return;
  }

  if (req.method === "POST") {
    const createInput = insertMockInterviewSchema.omit({ userId: true });
    try {
      const parsed = createInput.parse(req.body);
      const [mock] = await getDb().insert(mockInterviews).values({ ...parsed, userId }).returning();
      res.status(201).json(mock);
    } catch (e) {
      if (e instanceof z.ZodError) { res.status(400).json(e.errors); } else { throw e; }
    }
    return;
  }

  if (req.method === "DELETE") {
    const id = parseInt(req.query.id as string);
    if (isNaN(id)) { res.status(400).json({ message: "Invalid ID" }); return; }
    await getDb().delete(mockInterviews).where(and(eq(mockInterviews.id, id), eq(mockInterviews.userId, userId)));
    res.status(204).end();
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}

async function handleLogs(req: VercelRequest, res: VercelResponse) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  const userId = authUser.userId;

  if (req.method === "GET") {
    const list = await getDb().select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date));
    res.status(200).json(list);
    return;
  }

  if (req.method === "POST") {
    const createInput = insertDailyLogSchema.omit({ userId: true });
    try {
      const parsed = createInput.parse(req.body);
      const [log] = await getDb().insert(dailyLogs).values({ ...parsed, userId }).returning();
      res.status(201).json(log);
    } catch (e) {
      if (e instanceof z.ZodError) { res.status(400).json(e.errors); } else { throw e; }
    }
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}

async function handleHealth(req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, string> = {};
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.JWT_SECRET = process.env.JWT_SECRET ? "set" : "MISSING";
  checks.NODE_ENV = process.env.NODE_ENV || "not set";
  try {
    const testPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });
    const result = await testPool.query("SELECT 1 as ok");
    checks.db_connection = result.rows[0]?.ok === 1 ? "ok" : "unexpected";
    await testPool.end();
  } catch (e: any) {
    checks.db_connection = `FAIL: ${e.message}`;
  }
  res.status(200).json(checks);
}

// ============================================================
// MAIN HANDLER
// ============================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const route = (req.query.__route as string) || "";

  try {
    switch (route) {
      case "auth":
        return handleAuth(req, res);
      case "user":
        return handleUser(req, res);
      case "dsa":
        return handleDsa(req, res);
      case "cs":
        return handleCs(req, res);
      case "projects":
        return handleProjects(req, res);
      case "mocks":
        return handleMocks(req, res);
      case "logs":
        return handleLogs(req, res);
      case "health":
        return handleHealth(req, res);
      default:
        res.status(404).json({ message: `Unknown route: /api/${route}` });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}
