export type Trend = "up" | "down";
export type WorkoutStatus = "done" | "planned" | "skipped";
export type WorkoutType = "strength" | "cardio" | "mobility";

export const metrics = [
  { label: "Workouts this week", value: "4", change: "+12%", trend: "up" },
  { label: "Minutes", value: "186", change: "-8%", trend: "down" },
  { label: "Streak", value: "6 days", change: "+2", trend: "up" },
  { label: "Daily goal", value: "75%", change: "+5%", trend: "up" },
] as const;

export const weeklyActivity = [
  { day: "Mon", minutes: 42 },
  { day: "Tue", minutes: 28 },
  { day: "Wed", minutes: 55 },
  { day: "Thu", minutes: 0 },
  { day: "Fri", minutes: 36 },
  { day: "Sat", minutes: 25 },
  { day: "Sun", minutes: 0 },
];

export const recentWorkouts = [
  { name: "Upper body", type: "strength", minutes: 48, status: "done" },
  { name: "Easy run", type: "cardio", minutes: 32, status: "done" },
  { name: "Mobility flow", type: "mobility", minutes: 20, status: "planned" },
  { name: "Lower body", type: "strength", minutes: 45, status: "skipped" },
  { name: "Intervals", type: "cardio", minutes: 28, status: "planned" },
] satisfies Array<{
  name: string;
  type: WorkoutType;
  minutes: number;
  status: WorkoutStatus;
}>;

export const dailyGoals = [
  { label: "Workouts", current: 1, target: 1 },
  { label: "Minutes", current: 48, target: 45 },
  { label: "Water", current: 5, target: 8 },
  { label: "Steps", current: 6200, target: 8000 },
];

export const settings = {
  name: "Siyana Dafova",
  weeklyWorkoutGoal: 4,
  units: "km" as "km" | "mi",
};