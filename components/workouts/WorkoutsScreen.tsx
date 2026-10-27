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
  workoutMatches,
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

const EDIT_REQUEST = "edit:";

/** Blank form for `?new=1`. `edit:<id>` opens that workout. An edit id wins when both are set. */
function openRequest(create: boolean, editId: string | null) {
  if (editId) return `${EDIT_REQUEST}${editId}`;
  if (create) return "new";
  return null;
}

/**
 * `null` opens a blank form. A workout opens that record.
 * `undefined` means the query is not asking for a form, or the id is missing.
 */
function openTarget(
  request: string | null,
  workouts: Workout[],
): Workout | null | undefined {
  if (request === "new") return null;
  if (request?.startsWith(EDIT_REQUEST)) {
    const id = request.slice(EDIT_REQUEST.length);
    return workouts.find((workout) => workout.id === id);
  }
  return undefined;
}

/**
 * openNew and editId come from the server for the first render. searchParams catches a later
 * `?new=1` or `?edit=` without unmounting. handled keeps the form closed while that same query remains.
 */
export function WorkoutsScreen({
  openNew,
  editId,
}: {
  openNew: boolean;
  editId: string | null;
}) {
  const searchParams = useSearchParams();
  // A value from the hook wins. The server prop covers the first render, when the hook can still be empty.
  const request = openRequest(
    openNew || searchParams.get("new") === "1",
    searchParams.get("edit") || editId,
  );
  // Written by the header search. Kept in the URL so Back and reload keep the results.
  const query = searchParams.get("q") ?? "";
  const { workouts, profile, deleteWorkout } = useFitness();
  const initial = openTarget(request, workouts);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(initial !== undefined);
  const [handled, setHandled] = useState(request);
  const [editing, setEditing] = useState<Workout | null>(initial ?? null);
  // Kept after close so the text does not blank out while the dialog animates away.
  const [pendingDelete, setPendingDelete] = useState<Workout | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // During render, not in an effect: open the form in the same frame the query arrives.
  if (request !== handled) {
    setHandled(request);
    const target = openTarget(request, workouts);
    if (target !== undefined) {
      setEditing(target);
      setFormOpen(true);
    }
  }

  const visible = workouts
    .filter((workout) => typeFilter === "all" || workout.type === typeFilter)
    .filter(
      (workout) => statusFilter === "all" || workout.status === statusFilter,
    )
    .filter((workout) => workoutMatches(workout, query))
    .sort(compareWorkoutNewest);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function clearFilters() {
    setTypeFilter("all");
    setStatusFilter("all");
    if (query) window.history.replaceState(null, "", "/workouts");
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
                aria-pressed={typeFilter === type}
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
        <EmptyState
          message={
            query.trim()
              ? `No workouts match "${query.trim()}".`
              : "No workouts match these filters."
          }
          action={
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <Card className="min-w-0">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Workout</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Minutes</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Distance
                  </TableHead>
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
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {workoutTypeLabels[workout.type]}
                    </TableCell>
                    <TableCell>{workout.minutes}</TableCell>
                    <TableCell className="hidden sm:table-cell">
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
                        onClick={() => {
                          setPendingDelete(workout);
                          setDeleteOpen(true);
                        }}
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

      <WorkoutDialog
        open={formOpen}
        workout={editing}
        units={profile.units}
        onOpenChange={setFormOpen}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete workout"
        description={
          pendingDelete
            ? `Remove ${pendingDelete.name}? This deletes it from this browser.`
            : ""
        }
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteWorkout(pendingDelete.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
