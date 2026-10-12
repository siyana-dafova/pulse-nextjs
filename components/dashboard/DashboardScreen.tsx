"use client";

import Link from "next/link";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import DailyGoals from "@/components/dashboard/DailyGoals";
import RecentWorkouts from "@/components/dashboard/RecentWorkouts";
import StatCard from "@/components/dashboard/StatCard";
import { useFitness } from "@/components/fitness/fitness-context";
import { PageToolbar } from "@/components/fitness/page-toolbar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayISO } from "@/lib/fitness-data";
import {
  compareWorkoutNewest,
  dashboardStats,
  goalCurrent,
  weekdayActivity,
} from "@/lib/fitness-stats";

/** Assembles the dashboard. The formulas live in lib/fitness-stats.ts. */
export function DashboardScreen() {
  const { workouts, goals } = useFitness();
  const today = todayISO();
  const stats = dashboardStats(workouts, goals, today);
  const activity = weekdayActivity(workouts, today);
  const recent = [...workouts].sort(compareWorkoutNewest).slice(0, 5);
  const todayGoals = goals.map((goal) => ({
    id: goal.id,
    label: goal.label,
    current: goalCurrent(goal, workouts, today),
    target: goal.target,
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageToolbar description="Your training this week.">
        <Link href="/workouts?new=1" className={buttonVariants()}>
          Log workout
        </Link>
      </PageToolbar>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This week</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activity} />
          </CardContent>
        </Card>
        <DailyGoals goals={todayGoals} />
      </div>

      <RecentWorkouts workouts={recent} />
    </div>
  );
}
