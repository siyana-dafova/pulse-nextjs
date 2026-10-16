"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/fitness/empty-state";
import { useFitness } from "@/components/fitness/fitness-context";
import { PageToolbar } from "@/components/fitness/page-toolbar";
import { MinutesBarChart } from "@/components/reports/MinutesBarChart";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDisplayDate,
  todayISO,
  workoutTypeLabels,
  type WorkoutType,
} from "@/lib/fitness-data";
import {
  completionPercent,
  doneWorkouts,
  minutesByType,
  reportSummary,
  sumMinutes,
  type ReportPeriod,
  weekdayActivity,
  weeksInPeriod,
  workoutsInRange,
  workoutsUntil,
} from "@/lib/fitness-stats";

const typeColors: Record<WorkoutType, string> = {
  strength: "var(--chart-1)",
  cardio: "var(--chart-2)",
  mobility: "var(--chart-3)",
};

export function ReportsScreen() {
  const { workouts } = useFitness();
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const today = todayISO();
  const weeks = weeksInPeriod(today, period);
  const start = weeks[0].start;
  const end = weeks[weeks.length - 1].end;
  const inPeriod = workoutsInRange(workouts, start, end);
  const summary = reportSummary(inPeriod, today);
  const types = minutesByType(inPeriod);
  const maxTypeMinutes = Math.max(...types.map((item) => item.minutes), 1);

  // One week: 7 days. Four weeks: one bar per week, done minutes only.
  const chartData =
    period === "week"
      ? weekdayActivity(workouts, today).map((day) => ({
          label: day.day,
          minutes: day.minutes,
        }))
      : weeks.map((week) => ({
          label: formatDisplayDate(week.start),
          minutes: sumMinutes(
            doneWorkouts(workoutsInRange(workouts, week.start, week.end)),
          ),
        }));

  return (
    <div className="flex flex-col gap-4">
      <PageToolbar description="See how your training adds up.">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={period === "week" ? "default" : "outline"}
            aria-pressed={period === "week"}
            onClick={() => setPeriod("week")}
          >
            This week
          </Button>
          <Button
            type="button"
            size="sm"
            variant={period === "four" ? "default" : "outline"}
            aria-pressed={period === "four"}
            onClick={() => setPeriod("four")}
          >
            Last 4 weeks
          </Button>
        </div>
      </PageToolbar>

      {inPeriod.length === 0 ? (
        <EmptyState
          message="No workouts in this period."
          action={
            <Link href="/workouts?new=1" className={buttonVariants()}>
              Log workout
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Stat label="Workouts" value={String(summary.workouts)} />
            <Stat label="Minutes" value={String(summary.minutes)} />
            <Stat label="Avg minutes" value={String(summary.average)} />
            <Stat
              label="Completion"
              value={
                summary.completion == null ? "—" : `${summary.completion}%`
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Minutes</CardTitle>
              </CardHeader>
              <CardContent>
                <MinutesBarChart data={chartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>By type</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {types.map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm">
                      <span>{workoutTypeLabels[item.type]}</span>
                      <span className="text-muted-foreground">
                        {item.minutes}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.round((item.minutes / maxTypeMinutes) * 100)}%`,
                          background: typeColors[item.type],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weeks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Workouts</TableHead>
                    <TableHead>Minutes</TableHead>
                    <TableHead>Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeks.map((week) => {
                    const rows = workoutsInRange(
                      workouts,
                      week.start,
                      week.end,
                    );
                    const done = doneWorkouts(rows);
                    const completion = completionPercent(
                      workoutsUntil(rows, today),
                    );
                    return (
                      <TableRow key={week.start}>
                        <TableCell>{week.label}</TableCell>
                        <TableCell>{done.length}</TableCell>
                        <TableCell>{sumMinutes(done)}</TableCell>
                        <TableCell>
                          {completion == null ? "—" : `${completion}%`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-medium text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
