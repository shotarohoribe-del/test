import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
  date,
} from "drizzle-orm/mysql-core";

// ─── Core users table (kept for OAuth compatibility) ─────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Athletes (custom auth, separate from OAuth users) ───────────────────────
export const athletes = mysqlTable("athletes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  role: mysqlEnum("role", ["athlete", "admin"]).default("athlete").notNull(),
  sportMode: mysqlEnum("sportMode", ["track", "xc"]).default("track").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Athlete = typeof athletes.$inferSelect;
export type InsertAthlete = typeof athletes.$inferInsert;

// ─── Workout Library ──────────────────────────────────────────────────────────
export const workouts = mysqlTable("workouts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["track", "xc", "strength", "general"]).default("general").notNull(),
  eventDetails: text("eventDetails"),   // e.g. "1600m, 800m, 3200m"
  venue: varchar("venue", { length: 256 }), // e.g. "Crystal Springs"
  estimatedMiles: float("estimatedMiles"),
  isLibrary: boolean("isLibrary").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = typeof workouts.$inferInsert;

// ─── Calendar Events ──────────────────────────────────────────────────────────
export const calendarEvents = mysqlTable("calendarEvents", {
  id: int("id").autoincrement().primaryKey(),
  athleteId: int("athleteId"),          // null = whole team
  workoutId: int("workoutId"),          // null for races/notices
  eventDate: date("eventDate").notNull(),
  eventType: mysqlEnum("eventType", ["workout", "race", "notice"]).default("workout").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  notes: text("notes"),
  venue: varchar("venue", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

// ─── Mileage Tracking ─────────────────────────────────────────────────────────
export const mileage = mysqlTable("mileage", {
  id: int("id").autoincrement().primaryKey(),
  athleteId: int("athleteId").notNull(),
  weekStart: date("weekStart").notNull(),  // Monday of the week
  plannedMiles: float("plannedMiles").default(0),
  actualMiles: float("actualMiles").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mileage = typeof mileage.$inferSelect;
export type InsertMileage = typeof mileage.$inferInsert;

// ─── Pace Charts (per athlete) ────────────────────────────────────────────────
export const paceCharts = mysqlTable("paceCharts", {
  id: int("id").autoincrement().primaryKey(),
  athleteId: int("athleteId").notNull(),
  paceType: varchar("paceType", { length: 64 }).notNull(), // e.g. "Easy", "Tempo", "Goal 1600m"
  paceValue: varchar("paceValue", { length: 32 }).notNull(), // e.g. "7:30/mi"
  notes: text("notes"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaceChart = typeof paceCharts.$inferSelect;
export type InsertPaceChart = typeof paceCharts.$inferInsert;

// ─── Strength & Conditioning Circuits ────────────────────────────────────────
export const circuits = mysqlTable("circuits", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  exercises: json("exercises").notNull(), // Array of { name, sets, reps, notes }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Circuit = typeof circuits.$inferSelect;
export type InsertCircuit = typeof circuits.$inferInsert;

// ─── S&C Assignments ──────────────────────────────────────────────────────────
export const circuitAssignments = mysqlTable("circuitAssignments", {
  id: int("id").autoincrement().primaryKey(),
  circuitId: int("circuitId").notNull(),
  athleteId: int("athleteId"),           // null = whole team
  assignedDate: date("assignedDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CircuitAssignment = typeof circuitAssignments.$inferSelect;
export type InsertCircuitAssignment = typeof circuitAssignments.$inferInsert;
