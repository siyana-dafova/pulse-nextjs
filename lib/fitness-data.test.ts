import { describe, expect, it } from "vitest";
import {
  addDays,
  formatWeekLabel,
  initials,
  normalizeWorkout,
  startOfWeek,
  type WorkoutInput,
} from "@/lib/fitness-data";

describe("startOfWeek", () => {
  it("steps Sunday back to the Monday before it", () => {
    expect(startOfWeek("2026-11-15")).toBe("2026-11-09");
  });

  it("keeps Monday as is", () => {
    expect(startOfWeek("2026-11-16")).toBe("2026-11-16");
  });

  it("finds Monday from mid-week", () => {
    expect(startOfWeek("2026-11-19")).toBe("2026-11-16");
  });
});

describe("addDays", () => {
  it("crosses the end of a month", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("crosses the end of a year", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("handles a leap day", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
});

describe("formatWeekLabel", () => {
  it("names both months when the week spans two", () => {
    expect(formatWeekLabel("2026-10-26")).toBe("Oct 26 – Nov 1");
  });

  it("names the month once when the week stays in it", () => {
    expect(formatWeekLabel("2026-11-09")).toBe("Nov 9 – 15");
  });
});

describe("normalizeWorkout", () => {
  const base: WorkoutInput = {
    name: "  Upper body  ",
    type: "strength",
    minutes: 45,
    status: "done",
    date: "2026-11-19",
  };

  it("drops distance for a non-cardio workout", () => {
    expect(normalizeWorkout({ ...base, distance: 5 }).distance).toBeUndefined();
  });

  it("keeps a positive distance for cardio", () => {
    expect(
      normalizeWorkout({ ...base, type: "cardio", distance: 5 }).distance,
    ).toBe(5);
  });

  it("drops a zero distance for cardio", () => {
    expect(
      normalizeWorkout({ ...base, type: "cardio", distance: 0 }).distance,
    ).toBeUndefined();
  });

  it("trims the name", () => {
    expect(normalizeWorkout(base).name).toBe("Upper body");
  });
});

describe("initials", () => {
  it("falls back to P for an empty name", () => {
    expect(initials("")).toBe("P");
    expect(initials("   ")).toBe("P");
  });

  it("takes the first two letters of a single word", () => {
    expect(initials("siyana")).toBe("SI");
  });

  it("takes the first letter of the first and last word", () => {
    expect(initials("Siyana Dafova")).toBe("SD");
    expect(initials("Anna Maria Ivanova")).toBe("AI");
  });
});
