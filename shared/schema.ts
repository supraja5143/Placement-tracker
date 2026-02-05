import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// === DSA TRACKER ===
export const dsaTopics = pgTable("dsa_topics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key handled in app logic/storage
  topic: text("topic").notNull(),
  category: text("category").notNull(), // e.g., Arrays, Trees, DP
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
});

export const insertDsaTopicSchema = createInsertSchema(dsaTopics).omit({ id: true });

// === CS FUNDAMENTALS TRACKER ===
export const csTopics = pgTable("cs_topics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(), // OS, DBMS, CN, OOPs
  topic: text("topic").notNull(),
  status: text("status").notNull().default("not_started"),
});

export const insertCsTopicSchema = createInsertSchema(csTopics).omit({ id: true });

// === PROJECTS TRACKER ===
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  techStack: text("tech_stack").notNull(),
  status: text("status").notNull().default("planned"), // planned, in_progress, completed
  isInterviewReady: boolean("is_interview_ready").default(false),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });

// === MOCK INTERVIEW TRACKER ===
export const mockInterviews = pgTable("mock_interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  topicsCovered: text("topics_covered").notNull(),
  selfRating: integer("self_rating").notNull(), // 1-10
  feedback: text("feedback"),
});

export const insertMockInterviewSchema = createInsertSchema(mockInterviews).omit({ id: true });

// === DAILY PREPARATION LOG ===
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull().defaultNow(),
  content: text("content").notNull(),
  hoursSpent: integer("hours_spent").notNull(),
});

export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({ id: true });

// === CUSTOM TRACKERS ===
export const customSections = pgTable("custom_sections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("BookOpen"),
});

export const insertCustomSectionSchema = createInsertSchema(customSections).omit({ id: true });

export const customTopics = pgTable("custom_topics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sectionId: integer("section_id").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("not_started"),
});

export const insertCustomTopicSchema = createInsertSchema(customTopics).omit({ id: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type DsaTopic = typeof dsaTopics.$inferSelect;
export type InsertDsaTopic = z.infer<typeof insertDsaTopicSchema>;

export type CsTopic = typeof csTopics.$inferSelect;
export type InsertCsTopic = z.infer<typeof insertCsTopicSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type MockInterview = typeof mockInterviews.$inferSelect;
export type InsertMockInterview = z.infer<typeof insertMockInterviewSchema>;

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;

export type CustomSection = typeof customSections.$inferSelect;
export type InsertCustomSection = z.infer<typeof insertCustomSectionSchema>;

export type CustomTopic = typeof customTopics.$inferSelect;
export type InsertCustomTopic = z.infer<typeof insertCustomTopicSchema>;
