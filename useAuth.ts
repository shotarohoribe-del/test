import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getAthleteByUsername: vi.fn(),
  getAthleteById: vi.fn(),
  getAllAthletes: vi.fn().mockResolvedValue([]),
  createAthlete: vi.fn().mockResolvedValue({}),
  deactivateAthlete: vi.fn().mockResolvedValue({}),
  updateAthleteSportMode: vi.fn().mockResolvedValue({}),
  getAllWorkouts: vi.fn().mockResolvedValue([]),
  getWorkoutById: vi.fn(),
  createWorkout: vi.fn().mockResolvedValue({}),
  deleteWorkout: vi.fn().mockResolvedValue({}),
  countWorkouts: vi.fn().mockResolvedValue(7),
  getCalendarEventsForAthlete: vi.fn().mockResolvedValue([]),
  getAllCalendarEvents: vi.fn().mockResolvedValue([]),
  createCalendarEvent: vi.fn().mockResolvedValue({}),
  deleteCalendarEvent: vi.fn().mockResolvedValue({}),
  getMileageForAthlete: vi.fn().mockResolvedValue([]),
  setPlannedMileage: vi.fn().mockResolvedValue({}),
  setActualMileage: vi.fn().mockResolvedValue({}),
  upsertMileage: vi.fn().mockResolvedValue({}),
  getPaceChartForAthlete: vi.fn().mockResolvedValue([]),
  upsertPaceEntry: vi.fn().mockResolvedValue({}),
  deletePaceEntry: vi.fn().mockResolvedValue({}),
  getAllCircuits: vi.fn().mockResolvedValue([]),
  createCircuit: vi.fn().mockResolvedValue({}),
  deleteCircuit: vi.fn().mockResolvedValue({}),
  getCircuitAssignmentsForAthlete: vi.fn().mockResolvedValue([]),
  getAllCircuitAssignments: vi.fn().mockResolvedValue([]),
  createCircuitAssignment: vi.fn().mockResolvedValue({}),
  deleteCircuitAssignment: vi.fn().mockResolvedValue({}),
  upsertUser: vi.fn().mockResolvedValue({}),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {}, cookies: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn(), cookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("athleteAuth.login", () => {
  it("returns UNAUTHORIZED for unknown username", async () => {
    const { getAthleteByUsername } = await import("./db");
    vi.mocked(getAthleteByUsername).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.athleteAuth.login({ username: "nobody", password: "pass" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("athleteAuth.me", () => {
  it("returns null when no cookie is present", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.athleteAuth.me();
    expect(result).toBeNull();
  });
});

describe("workouts.list", () => {
  it("returns an empty array when no workouts exist", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.workouts.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("calendar.getForAthlete", () => {
  it("returns empty array for a given athlete and date range", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.calendar.getForAthlete({
      athleteId: 1,
      startDate: "2025-01-01",
      endDate: "2025-01-07",
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("mileage.getForAthlete", () => {
  it("returns empty array when no mileage logged", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.mileage.getForAthlete({ athleteId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("paceCharts.getForAthlete", () => {
  it("returns empty array when no paces set", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.paceCharts.getForAthlete({ athleteId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("circuits.list", () => {
  it("returns empty array when no circuits exist", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.circuits.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
