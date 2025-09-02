import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  currentWeek: integer("current_week").notNull().default(1),
  currentSuggestion: integer("current_suggestion").notNull().default(1),
  completedSuggestions: integer("completed_suggestions").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  lastActiveAt: timestamp("last_active_at").notNull().default(sql`now()`),
});

export const suggestions = pgTable("suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(),
  day: integer("day").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
});

export const userReflections = pgTable("user_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  suggestionId: varchar("suggestion_id").notNull(),
  reflection: text("reflection").notNull(),
  aiResponse: text("ai_response"),
  sentiment: text("sentiment"), // 'positive', 'negative', 'neutral'
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  mood: text("mood"), // 'great', 'good', 'okay', 'struggling'
  week: integer("week"),
  day: integer("day"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const weeklyCompletions = pgTable("weekly_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  week: integer("week").notNull(),
  reflection: text("reflection"),
  completedAt: timestamp("completed_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
});

export const insertUserReflectionSchema = createInsertSchema(userReflections).omit({
  id: true,
  aiResponse: true,
  sentiment: true,
  createdAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyCompletionSchema = createInsertSchema(weeklyCompletions).omit({
  id: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type UserReflection = typeof userReflections.$inferSelect;
export type InsertUserReflection = z.infer<typeof insertUserReflectionSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type WeeklyCompletion = typeof weeklyCompletions.$inferSelect;
export type InsertWeeklyCompletion = z.infer<typeof insertWeeklyCompletionSchema>;
