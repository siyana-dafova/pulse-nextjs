"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/fitness/status-badge";
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
  workoutTypeLabels,
  type Workout,
} from "@/lib/fitness-data";

export default function RecentWorkouts({ workouts }: { workouts: Workout[] }) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent workouts</CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workouts yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Workout</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Minutes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow
                  key={workout.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  // Opens the list, not an editor for this row.
                  onClick={() => router.push("/workouts")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") router.push("/workouts");
                  }}
                >
                  <TableCell>{formatDisplayDate(workout.date)}</TableCell>
                  <TableCell className="font-medium">{workout.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {workoutTypeLabels[workout.type]}
                  </TableCell>
                  <TableCell>{workout.minutes}</TableCell>
                  <TableCell>
                    <StatusBadge status={workout.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
