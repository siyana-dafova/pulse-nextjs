/**
 * Pure calculations with no React. Screens only call them.
 * Minutes, streak, and daily goals count workouts with status done.
 */

import {
  addDays,
  formatWeekday,
  formatWeekLabel,
  startOfWeek,
  type Goal,
  type Trend,
  type Workout,
  type WorkoutType,
} from "@/lib/fitness-data";

export type WeekRange = {
  start: string;
  end: string;
  label: string;
};

export type ReportPeriod = "week" | "four";

export function weekRange(anchor: string, weeksAgo = 0): WeekRange {
  const start = addDays(startOfWeek(anchor), -7 * weeksAgo);
  return {
    start,
    end: addDays(start, 6),
    label: formatWeekLabel(start),
  };
}

/** One or four weeks, oldest first, so the chart grows to the right. */
export function weeksInPeriod(today: string, period: ReportPeriod) {
  const count = period === "week" ? 1 : 4;
  return Array.from({ length: count }, (_, index) =>
    weekRange(today, count - 1 - index),
  );
}

export function inRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

export function workoutsInRange(
  workouts: Workout[],
  start: string,
  end: string,
) {
  return workouts.filter((workout) => inRange(workout.date, start, end));
}

export function doneWorkouts(workouts: Workout[]) {
  return workouts.filter((workout) => workout.status === "done");
}

export function sumMinutes(workouts: Workout[]) {
  return workouts.reduce((total, workout) => total + workout.minutes, 0);
}

export function compareWorkoutNewest(a: Workout, b: Workout) {
  return b.date.localeCompare(a.date) || a.name.localeCompare(b.name);
}

export function percentOf(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/** Done divided by every workout in the period, including planned and skipped. An empty list is `null`, not 0%. */
export function completionPercent(workouts: Workout[]) {
  if (workouts.length === 0) return null;
  const done = doneWorkouts(workouts).length;
  return Math.round((done / workouts.length) * 100);
}

/** Relative change in %. A previous value of 0 returns the absolute count, because a percent would be infinite. */
export function formatDelta(
  current: number,
  previous: number,
): { change: string; trend: Trend } {
  if (previous === 0) {
    if (current === 0) return { change: "0%", trend: "up" };
    return { change: `+${current}`, trend: "up" };
  }

  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct > 0 ? "+" : "";
  return { change: `${sign}${pct}%`, trend: pct >= 0 ? "up" : "down" };
}

/** Point difference (62 − 57 = +5), not how many percent the percent grew. A % sign is appended. */
export function formatPointDelta(
  current: number,
  previous: number,
): { change: string; trend: Trend } {
  const diff = current - previous;
  const sign = diff > 0 ? "+" : "";
  return { change: `${sign}${diff}%`, trend: diff >= 0 ? "up" : "down" };
}

/** `workouts` and `minutes` are counted from done workouts on that day. `manual` returns the stored `current`. */
export function goalCurrent(goal: Goal, workouts: Workout[], day: string) {
  const doneToday = doneWorkouts(workouts).filter(
    (workout) => workout.date === day,
  );
  if (goal.kind === "workouts") return doneToday.length;
  if (goal.kind === "minutes") return sumMinutes(doneToday);
  return goal.current;
}

/** Average of every goal's percent. Each percent is capped at 100. */
export function dailyGoalPercent(
  goals: Goal[],
  workouts: Workout[],
  day: string,
) {
  if (goals.length === 0) return 0;
  const total = goals.reduce(
    (sum, goal) =>
      sum + percentOf(goalCurrent(goal, workouts, day), goal.target),
    0,
  );
  return Math.round(total / goals.length);
}

/**
 * Consecutive days with at least one done workout.
 * If today has none yet, counting starts yesterday so the streak does not break before the day ends.
 */
export function streakCount(workouts: Workout[], today: string) {
  const doneDates = new Set(
    doneWorkouts(workouts).map((workout) => workout.date),
  );
  let cursor = doneDates.has(today) ? today : addDays(today, -1);
  if (!doneDates.has(cursor)) return 0;

  let count = 0;
  while (doneDates.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function weekdayActivity(workouts: Workout[], today: string) {
  const week = weekRange(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(week.start, index);
    const minutes = sumMinutes(
      doneWorkouts(workouts).filter((workout) => workout.date === date),
    );
    return { day: formatWeekday(date), minutes };
  });
}

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  trend: Trend;
};

export function dashboardStats(
  workouts: Workout[],
  goals: Goal[],
  today: string,
) {
  const currentWeek = weekRange(today);
  const previousWeek = weekRange(today, 1);
  const doneThisWeek = doneWorkouts(
    workoutsInRange(workouts, currentWeek.start, currentWeek.end),
  );
  const doneLastWeek = doneWorkouts(
    workoutsInRange(workouts, previousWeek.start, previousWeek.end),
  );
  const minutesThisWeek = sumMinutes(doneThisWeek);
  const minutesLastWeek = sumMinutes(doneLastWeek);
  const streak = streakCount(workouts, today);
  const streakYesterday = streakCount(workouts, addDays(today, -1));
  const daily = dailyGoalPercent(goals, workouts, today);
  const dailyYesterday = dailyGoalPercent(goals, workouts, addDays(today, -1));

  const workoutDelta = formatDelta(doneThisWeek.length, doneLastWeek.length);
  const minuteDelta = formatDelta(minutesThisWeek, minutesLastWeek);
  const streakDelta = formatPointDelta(streak, streakYesterday);
  const dailyDelta = formatPointDelta(daily, dailyYesterday);

  const stats: DashboardStat[] = [
    {
      label: "Workouts this week",
      value: String(doneThisWeek.length),
      ...workoutDelta,
    },
    {
      label: "Minutes",
      value: String(minutesThisWeek),
      ...minuteDelta,
    },
    {
      label: "Streak",
      value: `${streak} ${streak === 1 ? "day" : "days"}`,
      // formatPointDelta appends %. This delta is in days, so the sign is removed.
      change: streakDelta.change.replace("%", ""),
      trend: streakDelta.trend,
    },
    {
      label: "Daily goal",
      value: `${daily}%`,
      ...dailyDelta,
    },
  ];

  return stats;
}

export function minutesByType(workouts: Workout[]) {
  const done = doneWorkouts(workouts);
  return (["strength", "cardio", "mobility"] as WorkoutType[]).map((type) => ({
    type,
    minutes: sumMinutes(done.filter((workout) => workout.type === type)),
  }));
}

export function reportSummary(workouts: Workout[]) {
  const done = doneWorkouts(workouts);
  const minutes = sumMinutes(done);
  return {
    workouts: workouts.length,
    minutes,
    average: done.length === 0 ? 0 : Math.round(minutes / done.length),
    completion: completionPercent(workouts),
  };
}
