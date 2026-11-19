import { describe, expect, it } from "vitest";
import type { Goal, Workout, WorkoutStatus } from "@/lib/fitness-data";
import {
  completionPercent,
  dailyGoalPercent,
  formatDelta,
  streakCount,
  weeksInPeriod,
} from "@/lib/fitness-stats";

const today = "2026-11-19";

let nextId = 0;

function workout(
  date: string,
  status: WorkoutStatus = "done",
  minutes = 30,
): Workout {
  nextId += 1;
  return {
    id: `w${nextId}`,
    name: "Session",
    type: "strength",
    minutes,
    status,
    date,
  };
}

function goal(kind: Goal["kind"], target: number, current = 0): Goal {
  return { id: `goal-${kind}-${target}`, label: kind, target, current, kind };
}

describe("streakCount", () => {
  it("starts from yesterday when today has no workout yet", () => {
    const workouts = [workout("2026-11-18"), workout("2026-11-17")];
    expect(streakCount(workouts, today)).toBe(2);
  });

  it("includes today when today has a workout", () => {
    const workouts = [workout(today), workout("2026-11-18")];
    expect(streakCount(workouts, today)).toBe(2);
  });

  it("stops at the first day without a workout", () => {
    const workouts = [
      workout(today),
      workout("2026-11-18"),
      workout("2026-11-16"),
      workout("2026-11-15"),
    ];
    expect(streakCount(workouts, today)).toBe(2);
  });

  it("is 0 when neither today nor yesterday has a workout", () => {
    expect(streakCount([workout("2026-11-17")], today)).toBe(0);
  });

  it("ignores skipped and planned workouts", () => {
    const workouts = [
      workout("2026-11-18", "skipped"),
      workout(today, "planned"),
    ];
    expect(streakCount(workouts, today)).toBe(0);
  });
});

describe("formatDelta", () => {
  it("shows the absolute count when previous is 0", () => {
    expect(formatDelta(3, 0)).toEqual({ change: "+3", trend: "up" });
  });

  it("shows 0% when both are 0", () => {
    expect(formatDelta(0, 0)).toEqual({ change: "0%", trend: "up" });
  });

  it("shows a relative change otherwise", () => {
    expect(formatDelta(6, 4)).toEqual({ change: "+50%", trend: "up" });
    expect(formatDelta(2, 4)).toEqual({ change: "-50%", trend: "down" });
  });
});

describe("completionPercent", () => {
  it("is null for an empty list", () => {
    expect(completionPercent([])).toBeNull();
  });

  it("divides done by every workout", () => {
    const workouts = [
      workout(today),
      workout(today),
      workout(today, "skipped"),
    ];
    expect(completionPercent(workouts)).toBe(67);
  });
});

describe("dailyGoalPercent", () => {
  it("caps each goal at 100 before averaging", () => {
    const goals = [goal("manual", 8, 16), goal("manual", 10, 0)];
    expect(dailyGoalPercent(goals, [], today)).toBe(50);
  });

  it("caps goals counted from today's workouts", () => {
    const workouts = [workout(today), workout(today)];
    expect(dailyGoalPercent([goal("workouts", 1)], workouts, today)).toBe(100);
  });

  it("is 0 without goals", () => {
    expect(dailyGoalPercent([], [workout(today)], today)).toBe(0);
  });
});

describe("weeksInPeriod", () => {
  it("orders four weeks from oldest to newest", () => {
    const starts = weeksInPeriod(today, "four").map((week) => week.start);
    expect(starts).toEqual([
      "2026-10-26",
      "2026-11-02",
      "2026-11-09",
      "2026-11-16",
    ]);
  });

  it("returns only the current week for a one-week period", () => {
    expect(weeksInPeriod(today, "week")).toEqual([
      { start: "2026-11-16", end: "2026-11-22", label: "Nov 16 – 22" },
    ]);
  });
});
