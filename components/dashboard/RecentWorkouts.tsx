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
    <Card className="min-w-0">
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
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead>Minutes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell>{formatDisplayDate(workout.date)}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/workouts?edit=${encodeURIComponent(workout.id)}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {workout.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
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
