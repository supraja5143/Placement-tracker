import { 
  users, dsaTopics, csTopics, projects, mockInterviews, dailyLogs,
  type User, type InsertUser,
  type DsaTopic, type InsertDsaTopic,
  type CsTopic, type InsertCsTopic,
  type Project, type InsertProject,
  type MockInterview, type InsertMockInterview,
  type DailyLog, type InsertDailyLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // DSA
  getDsaTopics(userId: number): Promise<DsaTopic[]>;
  createDsaTopic(userId: number, topic: Omit<InsertDsaTopic, "userId">): Promise<DsaTopic>;
  updateDsaTopic(id: number, userId: number, updates: Partial<InsertDsaTopic>): Promise<DsaTopic>;

  // CS
  getCsTopics(userId: number): Promise<CsTopic[]>;
  createCsTopic(userId: number, topic: Omit<InsertCsTopic, "userId">): Promise<CsTopic>;
  updateCsTopic(id: number, userId: number, updates: Partial<InsertCsTopic>): Promise<CsTopic>;

  // Projects
  getProjects(userId: number): Promise<Project[]>;
  createProject(userId: number, project: Omit<InsertProject, "userId">): Promise<Project>;
  updateProject(id: number, userId: number, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number, userId: number): Promise<void>;

  // Mocks
  getMockInterviews(userId: number): Promise<MockInterview[]>;
  createMockInterview(userId: number, interview: Omit<InsertMockInterview, "userId">): Promise<MockInterview>;
  deleteMockInterview(id: number, userId: number): Promise<void>;

  // Logs
  getDailyLogs(userId: number): Promise<DailyLog[]>;
  createDailyLog(userId: number, log: Omit<InsertDailyLog, "userId">): Promise<DailyLog>;
}

export class DatabaseStorage implements IStorage {
  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // DSA
  async getDsaTopics(userId: number): Promise<DsaTopic[]> {
    return await db.select().from(dsaTopics).where(eq(dsaTopics.userId, userId));
  }

  async createDsaTopic(userId: number, topic: Omit<InsertDsaTopic, "userId">): Promise<DsaTopic> {
    const [newTopic] = await db.insert(dsaTopics).values({ ...topic, userId }).returning();
    return newTopic;
  }

  async updateDsaTopic(id: number, userId: number, updates: Partial<InsertDsaTopic>): Promise<DsaTopic> {
    const [updated] = await db
      .update(dsaTopics)
      .set(updates)
      .where(and(eq(dsaTopics.id, id), eq(dsaTopics.userId, userId)))
      .returning();
    return updated;
  }

  // CS
  async getCsTopics(userId: number): Promise<CsTopic[]> {
    return await db.select().from(csTopics).where(eq(csTopics.userId, userId));
  }

  async createCsTopic(userId: number, topic: Omit<InsertCsTopic, "userId">): Promise<CsTopic> {
    const [newTopic] = await db.insert(csTopics).values({ ...topic, userId }).returning();
    return newTopic;
  }

  async updateCsTopic(id: number, userId: number, updates: Partial<InsertCsTopic>): Promise<CsTopic> {
    const [updated] = await db
      .update(csTopics)
      .set(updates)
      .where(and(eq(csTopics.id, id), eq(csTopics.userId, userId)))
      .returning();
    return updated;
  }

  // Projects
  async getProjects(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(userId: number, project: Omit<InsertProject, "userId">): Promise<Project> {
    const [newProject] = await db.insert(projects).values({ ...project, userId }).returning();
    return newProject;
  }

  async updateProject(id: number, userId: number, updates: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return updated;
  }

  async deleteProject(id: number, userId: number): Promise<void> {
    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
  }

  // Mocks
  async getMockInterviews(userId: number): Promise<MockInterview[]> {
    return await db.select().from(mockInterviews).where(eq(mockInterviews.userId, userId)).orderBy(desc(mockInterviews.date));
  }

  async createMockInterview(userId: number, interview: Omit<InsertMockInterview, "userId">): Promise<MockInterview> {
    const [newInterview] = await db.insert(mockInterviews).values({ ...interview, userId }).returning();
    return newInterview;
  }

  async deleteMockInterview(id: number, userId: number): Promise<void> {
    await db.delete(mockInterviews).where(and(eq(mockInterviews.id, id), eq(mockInterviews.userId, userId)));
  }

  // Logs
  async getDailyLogs(userId: number): Promise<DailyLog[]> {
    return await db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.date));
  }

  async createDailyLog(userId: number, log: Omit<InsertDailyLog, "userId">): Promise<DailyLog> {
    const [newLog] = await db.insert(dailyLogs).values({ ...log, userId }).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
