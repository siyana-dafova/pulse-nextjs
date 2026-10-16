import Link from "next/link";
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
                <TableRow key={workout.id}>
                  <TableCell>{formatDisplayDate(workout.date)}</TableCell>
                  <TableCell className="font-medium">
                    {/* Opens the list, not an editor for this row. */}
                    <Link
                      href="/workouts"
                      className="underline-offset-4 hover:underline"
                    >
                      {workout.name}
                    </Link>
                  </TableCell>
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
