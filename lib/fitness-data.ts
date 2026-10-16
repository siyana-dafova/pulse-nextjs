/**
 * Types, seed data, and dates.
 * Dates are `YYYY-MM-DD` in the local calendar, not UTC.
 */

export type Trend = "up" | "down";
export type WorkoutStatus = "done" | "planned" | "skipped";
export type WorkoutType = "strength" | "cardio" | "mobility";
export type Units = "km" | "mi";
export type GoalKind = "workouts" | "minutes" | "manual";

export type Workout = {
  id: string;
  name: string;
  type: WorkoutType;
  minutes: number;
  status: WorkoutStatus;
  date: string;
  distance?: number;
};

export type WorkoutInput = {
  name: string;
  type: WorkoutType;
  minutes: number;
  status: WorkoutStatus;
  date: string;
  distance?: number;
};

/**
 * `workouts` and `minutes` are counted from today's done workouts.
 * `manual` stores `current` by hand. Only one goal of each derived kind is allowed.
 */
export type Goal = {
  id: string;
  label: string;
  target: number;
  current: number;
  kind: GoalKind;
};

export type GoalInput = {
  label: string;
  target: number;
  current: number;
  kind: GoalKind;
};

export type Profile = {
  name: string;
  email: string;
  weeklyWorkoutGoal: number;
  units: Units;
};

export const workoutTypes: WorkoutType[] = ["strength", "cardio", "mobility"];
export const workoutStatuses: WorkoutStatus[] = ["done", "planned", "skipped"];

export const workoutTypeLabels: Record<WorkoutType, string> = {
  strength: "Strength",
  cardio: "Cardio",
  mobility: "Mobility",
};

export const workoutStatusLabels: Record<WorkoutStatus, string> = {
  done: "Done",
  planned: "Planned",
  skipped: "Skipped",
};

export const goalKindLabels: Record<GoalKind, string> = {
  manual: "Manual",
  workouts: "Workouts",
  minutes: "Minutes",
};

export const initialProfile: Profile = {
  name: "Siyana Dafova",
  email: "siyana@example.com",
  weeklyWorkoutGoal: 4,
  units: "km",
};

export const initialGoals: Goal[] = [
  {
    id: "goal-workouts",
    label: "Workouts",
    target: 1,
    current: 0,
    kind: "workouts",
  },
  {
    id: "goal-minutes",
    label: "Minutes",
    target: 45,
    current: 0,
    kind: "minutes",
  },
  {
    id: "goal-water",
    label: "Water",
    target: 8,
    current: 5,
    kind: "manual",
  },
  {
    id: "goal-steps",
    label: "Steps",
    target: 8000,
    current: 6200,
    kind: "manual",
  },
];

/** Today as `YYYY-MM-DD` in the local calendar. */
export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Local midnight. `new Date("YYYY-MM-DD")` parses UTC and can land on the previous day. */
export function parseISODate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(iso: string, days: number) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Monday of that week. Sunday (`getDay() === 0`) steps back 6 days, not forward. */
export function startOfWeek(iso: string) {
  const weekday = parseISODate(iso).getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(iso, offset);
}

export function formatDisplayDate(iso: string) {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Every word of the query must appear in the name, type, status, or date as the table shows them.
 * Case does not matter, so "easy RUN" finds "Easy run". An empty query matches everything.
 */
export function workoutMatches(workout: Workout, query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = [
    workout.name,
    workoutTypeLabels[workout.type],
    workoutStatusLabels[workout.status],
    formatDisplayDate(workout.date),
  ]
    .join(" ")
    .toLowerCase();
  return words.every((word) => text.includes(word));
}

export function formatWeekday(iso: string) {
  return parseISODate(iso).toLocaleDateString("en-US", { weekday: "short" });
}

export function formatWeekLabel(start: string) {
  const end = addDays(start, 6);
  const startDate = parseISODate(start);
  const endDate = parseISODate(end);
  const startText = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endText =
    startDate.getMonth() === endDate.getMonth()
      ? String(endDate.getDate())
      : endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startText} – ${endText}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Pulse";
}

export function formatDistance(distance: number | undefined, units: Units) {
  if (distance == null) return "—";
  const text = Number.isInteger(distance)
    ? String(distance)
    : distance.toFixed(1);
  return `${text} ${units}`;
}

/** Distance is kept only for cardio and only when it is above 0, so a type change cannot leave a stale value. */
export function normalizeWorkout(input: WorkoutInput): Omit<Workout, "id"> {
  const distance =
    input.type === "cardio" && input.distance != null && input.distance > 0
      ? input.distance
      : undefined;

  return {
    name: input.name.trim(),
    type: input.type,
    minutes: input.minutes,
    status: input.status,
    date: input.date,
    distance,
  };
}

type SeedWorkout = {
  daysAgo: number;
  name: string;
  type: WorkoutType;
  minutes: number;
  status: WorkoutStatus;
  distance?: number;
};

const history: SeedWorkout[] = [
  {
    daysAgo: 0,
    name: "Upper body",
    type: "strength",
    minutes: 48,
    status: "done",
  },
  {
    daysAgo: 0,
    name: "Easy run",
    type: "cardio",
    minutes: 32,
    status: "done",
    distance: 5.2,
  },
  {
    daysAgo: 1,
    name: "Mobility flow",
    type: "mobility",
    minutes: 20,
    status: "done",
  },
  {
    daysAgo: 2,
    name: "Lower body",
    type: "strength",
    minutes: 45,
    status: "done",
  },
  {
    daysAgo: 3,
    name: "Intervals",
    type: "cardio",
    minutes: 28,
    status: "done",
    distance: 4.1,
  },
  {
    daysAgo: 4,
    name: "Core",
    type: "strength",
    minutes: 25,
    status: "skipped",
  },
  {
    daysAgo: 5,
    name: "Easy run",
    type: "cardio",
    minutes: 30,
    status: "done",
    distance: 4.8,
  },
  {
    daysAgo: 7,
    name: "Upper body",
    type: "strength",
    minutes: 50,
    status: "done",
  },
  {
    daysAgo: 8,
    name: "Tempo run",
    type: "cardio",
    minutes: 36,
    status: "skipped",
    distance: 6,
  },
  {
    daysAgo: 9,
    name: "Mobility flow",
    type: "mobility",
    minutes: 15,
    status: "done",
  },
  {
    daysAgo: 10,
    name: "Lower body",
    type: "strength",
    minutes: 42,
    status: "done",
  },
  {
    daysAgo: 12,
    name: "Intervals",
    type: "cardio",
    minutes: 25,
    status: "done",
    distance: 3.5,
  },
  {
    daysAgo: 14,
    name: "Full body",
    type: "strength",
    minutes: 55,
    status: "done",
  },
  {
    daysAgo: 15,
    name: "Long run",
    type: "cardio",
    minutes: 48,
    status: "done",
    distance: 8.2,
  },
  { daysAgo: 16, name: "Yoga", type: "mobility", minutes: 30, status: "done" },
  {
    daysAgo: 18,
    name: "Upper body",
    type: "strength",
    minutes: 40,
    status: "skipped",
  },
  {
    daysAgo: 19,
    name: "Easy run",
    type: "cardio",
    minutes: 28,
    status: "done",
    distance: 4.4,
  },
  {
    daysAgo: 21,
    name: "Lower body",
    type: "strength",
    minutes: 46,
    status: "done",
  },
  {
    daysAgo: 22,
    name: "Intervals",
    type: "cardio",
    minutes: 32,
    status: "done",
    distance: 5,
  },
  {
    daysAgo: 23,
    name: "Mobility flow",
    type: "mobility",
    minutes: 18,
    status: "done",
  },
  {
    daysAgo: 25,
    name: "Upper body",
    type: "strength",
    minutes: 44,
    status: "done",
  },
  {
    daysAgo: 26,
    name: "Easy run",
    type: "cardio",
    minutes: 34,
    status: "done",
    distance: 5.5,
  },
];

const upcoming = [
  { name: "Mobility flow", type: "mobility" as const, minutes: 20 },
  { name: "Lower body", type: "strength" as const, minutes: 45 },
  { name: "Intervals", type: "cardio" as const, minutes: 28, distance: 5 },
];

/**
 * Demo list relative to today, so it does not go stale.
 * Past sessions come from `history`. Planned ones fill tomorrow onward, only through Sunday of this week.
 */
export function createSeedWorkouts(today = todayISO()): Workout[] {
  const logged: Workout[] = history.map((item, index) => ({
    id: `workout-${index + 1}`,
    name: item.name,
    type: item.type,
    minutes: item.minutes,
    status: item.status,
    date: addDays(today, -item.daysAgo),
    distance: item.type === "cardio" ? item.distance : undefined,
  }));

  const weekEnd = addDays(startOfWeek(today), 6);
  let cursor = addDays(today, 1);
  const planned: Workout[] = [];

  for (const [index, item] of upcoming.entries()) {
    if (cursor > weekEnd) break;
    planned.push({
      id: `workout-plan-${index + 1}`,
      name: item.name,
      type: item.type,
      minutes: item.minutes,
      status: "planned",
      date: cursor,
      distance: item.type === "cardio" ? item.distance : undefined,
    });
    cursor = addDays(cursor, 1);
  }

  return [...logged, ...planned];
}
