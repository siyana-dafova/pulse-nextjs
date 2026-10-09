import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { recentWorkouts, WorkoutStatus } from "@/lib/fitness-data";
import { Badge } from "../ui/badge";

const RecentWorkouts = () => {
  function statusColor(status: WorkoutStatus) {
    switch (status) {
      case "done":
        return "bg-success/10 text-success";
      case "planned":
        return "bg-primary/10 text-primary";
      case "skipped":
        return "bg-destructive/10 text-destructive";
    }
  }
  return (
    <Card>
      <CardHeader>Recent Workouts</CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workout</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Minutes</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentWorkouts.map((workout) => (
              <TableRow key={workout.name}>
                <TableCell>{workout.name}</TableCell>
                <TableCell>{workout.type}</TableCell>
                <TableCell>{workout.minutes}</TableCell>
                <TableCell>
                  <Badge className={statusColor(workout.status)}>
                    {workout.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentWorkouts;
