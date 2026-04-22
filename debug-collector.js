import { and, asc, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  athletes,
  calendarEvents,
  circuitAssignments,
  circuits,
  InsertAthlete,
  InsertCalendarEvent,
  InsertCircuit,
  InsertCircuitAssignment,
  InsertMileage,
  InsertPaceChart,
  InsertUser,
  InsertWorkout,
  mileage,
  paceCharts,
  users,
  workouts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users (OAuth) ────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Athletes ─────────────────────────────────────────────────────────────────
export async function getAthleteByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(athletes)
    .where(and(eq(athletes.username, username), eq(athletes.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAthleteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(athletes).where(eq(athletes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAthletes() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(athletes)
    .where(eq(athletes.isActive, true))
    .orderBy(asc(athletes.name));
}

export async function createAthlete(data: InsertAthlete) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(athletes).values(data);
  return result;
}

export async function updateAthletePassword(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(athletes).set({ passwordHash }).where(eq(athletes.id, id));
}

export async function hardDeleteAthleteByUsername(username: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(athletes).where(eq(athletes.username, username));
}

export async function updateAthleteSportMode(id: number, sportMode: "track" | "xc") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(athletes).set({ sportMode }).where(eq(athletes.id, id));
}

export async function deactivateAthlete(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // Hard delete to avoid unique constraint issues on re-creation
  await db.delete(athletes).where(eq(athletes.id, id));
}

// ─── Workouts ─────────────────────────────────────────────────────────────────
export async function getAllWorkouts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workouts).orderBy(asc(workouts.type), asc(workouts.title));
}

export async function getWorkoutById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(workouts).where(eq(workouts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createWorkout(data: InsertWorkout) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(workouts).values(data);
  return result;
}

export async function deleteWorkout(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(workouts).where(eq(workouts.id, id));
}

export async function countWorkouts() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(workouts);
  return result.length;
}

// ─── Calendar Events ──────────────────────────────────────────────────────────
export async function getCalendarEventsForAthlete(
  athleteId: number,
  startDate: string,
  endDate: string
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(calendarEvents)
    .where(
      and(
        or(eq(calendarEvents.athleteId, athleteId), isNull(calendarEvents.athleteId)),
        sql`${calendarEvents.eventDate} >= ${startDate}`,
        sql`${calendarEvents.eventDate} <= ${endDate}`
      )
    )
    .orderBy(asc(calendarEvents.eventDate));
}

export async function getAllCalendarEvents(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(calendarEvents)
    .where(
      and(
        sql`${calendarEvents.eventDate} >= ${startDate}`,
        sql`${calendarEvents.eventDate} <= ${endDate}`
      )
    )
    .orderBy(asc(calendarEvents.eventDate));
}

export async function createCalendarEvent(data: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(calendarEvents).values(data);
  return result;
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
}

// ─── Mileage ──────────────────────────────────────────────────────────────────
export async function getMileageForAthlete(athleteId: number, weeks: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(mileage)
    .where(eq(mileage.athleteId, athleteId))
    .orderBy(asc(mileage.weekStart))
    .limit(weeks);
}

export async function upsertMileage(data: InsertMileage) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .insert(mileage)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        plannedMiles: data.plannedMiles,
        actualMiles: data.actualMiles,
      },
    });
}

export async function setPlannedMileage(
  athleteId: number,
  weekStart: string,
  plannedMiles: number
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const weekStartDate = new Date(weekStart);
  const existing = await db
    .select()
    .from(mileage)
    .where(
      and(eq(mileage.athleteId, athleteId), eq(mileage.weekStart, weekStartDate))
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(mileage)
      .set({ plannedMiles })
      .where(and(eq(mileage.athleteId, athleteId), eq(mileage.weekStart, weekStartDate)));
  } else {
    await db.insert(mileage).values({ athleteId, weekStart: weekStartDate, plannedMiles, actualMiles: 0 });
  }
}

export async function setActualMileage(
  athleteId: number,
  weekStart: string,
  actualMiles: number
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const weekStartDate = new Date(weekStart);
  const existing = await db
    .select()
    .from(mileage)
    .where(and(eq(mileage.athleteId, athleteId), eq(mileage.weekStart, weekStartDate)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(mileage)
      .set({ actualMiles })
      .where(and(eq(mileage.athleteId, athleteId), eq(mileage.weekStart, weekStartDate)));
  } else {
    await db.insert(mileage).values({ athleteId, weekStart: weekStartDate, plannedMiles: 0, actualMiles });
  }
}

// ─── Pace Charts ──────────────────────────────────────────────────────────────
export async function getPaceChartForAthlete(athleteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(paceCharts)
    .where(eq(paceCharts.athleteId, athleteId))
    .orderBy(asc(paceCharts.paceType));
}

export async function upsertPaceEntry(
  athleteId: number,
  paceType: string,
  paceValue: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(paceCharts)
    .where(and(eq(paceCharts.athleteId, athleteId), eq(paceCharts.paceType, paceType)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(paceCharts)
      .set({ paceValue, notes: notes !== undefined ? notes : null })
      .where(and(eq(paceCharts.athleteId, athleteId), eq(paceCharts.paceType, paceType)));
  } else {
    await db.insert(paceCharts).values({ athleteId, paceType, paceValue, notes: notes !== undefined ? notes : null });
  }
}

export async function deletePaceEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(paceCharts).where(eq(paceCharts.id, id));
}

// ─── Circuits ─────────────────────────────────────────────────────────────────
export async function getAllCircuits() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(circuits).orderBy(asc(circuits.title));
}

export async function getCircuitById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(circuits).where(eq(circuits.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCircuit(data: InsertCircuit) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(circuits).values(data);
}

export async function deleteCircuit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(circuits).where(eq(circuits.id, id));
}

export async function getCircuitAssignmentsForAthlete(
  athleteId: number,
  startDate: string,
  endDate: string
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      assignment: circuitAssignments,
      circuit: circuits,
    })
    .from(circuitAssignments)
    .innerJoin(circuits, eq(circuitAssignments.circuitId, circuits.id))
    .where(
      and(
        or(eq(circuitAssignments.athleteId, athleteId), isNull(circuitAssignments.athleteId)),
        gte(circuitAssignments.assignedDate, new Date(startDate)),
        lte(circuitAssignments.assignedDate, new Date(endDate))
      )
    )
    .orderBy(asc(circuitAssignments.assignedDate));
}

export async function createCircuitAssignment(data: InsertCircuitAssignment) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(circuitAssignments).values(data);
}

export async function deleteCircuitAssignment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(circuitAssignments).where(eq(circuitAssignments.id, id));
}

export async function getAllCircuitAssignments(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      assignment: circuitAssignments,
      circuit: circuits,
    })
    .from(circuitAssignments)
    .innerJoin(circuits, eq(circuitAssignments.circuitId, circuits.id))
    .where(
      and(
        gte(circuitAssignments.assignedDate, new Date(startDate)),
        lte(circuitAssignments.assignedDate, new Date(endDate))
      )
    )
    .orderBy(asc(circuitAssignments.assignedDate));
}
