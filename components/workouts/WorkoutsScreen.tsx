"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/fitness/confirm-dialog";
import { EmptyState } from "@/components/fitness/empty-state";
import { useFitness } from "@/components/fitness/fitness-context";
import { PageToolbar } from "@/components/fitness/page-toolbar";
import { StatusBadge } from "@/components/fitness/status-badge";
import { WorkoutDialog } from "@/components/workouts/WorkoutDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  formatDistance,
  workoutStatusLabels,
  workoutTypeLabels,
  workoutTypes,
  type Workout,
  type WorkoutStatus,
} from "@/lib/fitness-data";
import { compareWorkoutNewest } from "@/lib/fitness-stats";

const typeFilters = ["all", ...workoutTypes] as const;
type TypeFilter = (typeof typeFilters)[number];
type StatusFilter = WorkoutStatus | "all";

const statusItems: Record<StatusFilter, string> = {
  all: "All statuses",
  done: workoutStatusLabels.done,
  planned: workoutStatusLabels.planned,
  skipped: workoutStatusLabels.skipped,
};

/**
 * openNew comes from the server for the first render. searchParams catches a later ?new=1
 * without unmounting. armed keeps the form closed while that query is still in the URL.
 */
export function WorkoutsScreen({ openNew }: { openNew: boolean }) {
  const searchParams = useSearchParams();
  const requested = openNew || searchParams.get("new") === "1";
  const { workouts, profile, deleteWorkout } = useFitness();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(requested);
  const [armed, setArmed] = useState(requested);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Workout | null>(null);

  // During render, not in an effect: open the form in the same frame the query arrives.
  if (requested && !armed) {
    setArmed(true);
    setEditing(null);
    setFormOpen(true);
  } else if (!requested && armed) {
    setArmed(false);
  }

  const visible = workouts
    .filter((workout) => typeFilter === "all" || workout.type === typeFilter)
    .filter(
      (workout) => statusFilter === "all" || workout.status === statusFilter,
    )
    .sort(compareWorkoutNewest);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageToolbar description="Log and review your sessions.">
        {workouts.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {typeFilters.map((type) => (
              <Button
                key={type}
                type="button"
                size="sm"
                variant={typeFilter === type ? "default" : "outline"}
                onClick={() => setTypeFilter(type)}
              >
                {type === "all" ? "All" : workoutTypeLabels[type]}
              </Button>
            ))}
            <Select
              items={statusItems}
              value={statusFilter}
              onValueChange={(value) => {
                if (
                  value === "all" ||
                  value === "done" ||
                  value === "planned" ||
                  value === "skipped"
                ) {
                  setStatusFilter(value);
                }
              }}
            >
              <SelectTrigger aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusItems) as StatusFilter[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusItems[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={openCreate}>
              Add workout
            </Button>
          </div>
        ) : null}
      </PageToolbar>

      {workouts.length === 0 ? (
        <EmptyState
          message="No workouts yet."
          action={
            <Button type="button" onClick={openCreate}>
              Add workout
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState message="No workouts match these filters." />
      ) : (
        <Card className="min-w-0">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Workout</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Minutes</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Edit</TableHead>
                  <TableHead>Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((workout) => (
                  <TableRow key={workout.id}>
                    <TableCell>{formatDisplayDate(workout.date)}</TableCell>
                    <TableCell className="font-medium">
                      {workout.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {workoutTypeLabels[workout.type]}
                    </TableCell>
                    <TableCell>{workout.minutes}</TableCell>
                    <TableCell>
                      {formatDistance(workout.distance, profile.units)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={workout.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(workout);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setPendingDelete(workout)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {formOpen ? (
        <WorkoutDialog
          // A new key resets the draft. Without it, editing keeps the previous record's fields.
          key={editing?.id ?? "new"}
          workout={editing}
          units={profile.units}
          onOpenChange={setFormOpen}
        />
      ) : null}
      <ConfirmDialog
        open={pendingDelete != null}
        title="Delete workout"
        description={
          pendingDelete
            ? `Remove ${pendingDelete.name}? This only updates this browser.`
            : ""
        }
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={() => {
          if (pendingDelete) deleteWorkout(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
