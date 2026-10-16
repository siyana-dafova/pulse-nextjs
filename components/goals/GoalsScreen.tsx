"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/fitness/confirm-dialog";
import { EmptyState } from "@/components/fitness/empty-state";
import { useFitness } from "@/components/fitness/fitness-context";
import { PageToolbar } from "@/components/fitness/page-toolbar";
import { ProgressBar } from "@/components/fitness/progress-bar";
import { GoalDialog } from "@/components/goals/GoalDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayISO, type Goal } from "@/lib/fitness-data";
import {
  doneWorkouts,
  goalCurrent,
  sumMinutes,
  weekRange,
  workoutsInRange,
} from "@/lib/fitness-stats";

export function GoalsScreen() {
  const { workouts, goals, profile, updateGoal, deleteGoal } = useFitness();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  // Kept after close so the text does not blank out while the dialog animates away.
  const [pendingDelete, setPendingDelete] = useState<Goal | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const today = todayISO();
  const week = weekRange(today);
  const doneThisWeek = doneWorkouts(
    workoutsInRange(workouts, week.start, week.end),
  );
  const minutesGoal = goals.find((goal) => goal.kind === "minutes");
  const weekMinutes = sumMinutes(doneThisWeek);
  // The daily minutes target times 7. Separate from today's total on the card below.
  const weekMinuteTarget = minutesGoal ? minutesGoal.target * 7 : 0;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageToolbar description="Track daily targets and this week's progress.">
        {goals.length > 0 ? (
          <Button type="button" onClick={openCreate}>
            Add goal
          </Button>
        ) : null}
      </PageToolbar>

      <Card>
        <CardHeader>
          <CardTitle>This week</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between text-sm">
              {/* Target comes from settings (the week), not from the daily workouts goal. */}
              <span>Workouts</span>
              <span className="text-muted-foreground">
                {doneThisWeek.length}/{profile.weeklyWorkoutGoal}
              </span>
            </div>
            <ProgressBar
              current={doneThisWeek.length}
              target={profile.weeklyWorkoutGoal}
              size="md"
            />
          </div>
          {minutesGoal ? (
            <div>
              <div className="flex justify-between text-sm">
                <span>Minutes</span>
                <span className="text-muted-foreground">
                  {weekMinutes}/{weekMinuteTarget}
                </span>
              </div>
              <ProgressBar
                current={weekMinutes}
                target={weekMinuteTarget}
                size="md"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {weekMinutes} min this week. Add a minutes goal to track a target.
            </p>
          )}
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <EmptyState
          message="No goals yet."
          action={
            <Button type="button" onClick={openCreate}>
              Add goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              current={goalCurrent(goal, workouts, today)}
              onEdit={() => {
                setEditing(goal);
                setFormOpen(true);
              }}
              onDelete={() => {
                setPendingDelete(goal);
                setDeleteOpen(true);
              }}
              onCurrentChange={(current) =>
                updateGoal(goal.id, { ...goal, current })
              }
            />
          ))}
        </div>
      )}

      <GoalDialog open={formOpen} goal={editing} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete goal"
        description={
          pendingDelete
            ? `Remove ${pendingDelete.label}? This only updates this browser.`
            : ""
        }
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          if (pendingDelete) deleteGoal(pendingDelete.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}

function GoalCard({
  goal,
  current,
  onEdit,
  onDelete,
  onCurrentChange,
}: {
  goal: Goal;
  current: number;
  onEdit: () => void;
  onDelete: () => void;
  onCurrentChange: (current: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal.label}</CardTitle>
        <CardAction className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onDelete}
          >
            Delete
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {current}/{goal.target}
        </p>
        <ProgressBar current={current} target={goal.target} size="md" />
        {goal.kind === "manual" ? (
          <CurrentField
            // Recreates the field when the stored number changes, so old text does not linger.
            key={goal.current}
            goalId={goal.id}
            current={goal.current}
            onCurrentChange={onCurrentChange}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Counted from today&apos;s workouts.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CurrentField({
  goalId,
  current,
  onCurrentChange,
}: {
  goalId: string;
  current: number;
  onCurrentChange: (current: number) => void;
}) {
  const [draft, setDraft] = useState(String(current));

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`current-${goalId}`}>Current</Label>
      <Input
        id={`current-${goalId}`}
        type="number"
        min={0}
        step="any"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        // Save on blur, not on each digit. Otherwise a cleared field would become 0.
        onBlur={() => {
          const next = Number(draft);
          if (!Number.isFinite(next) || next < 0) {
            setDraft(String(current));
            return;
          }
          onCurrentChange(next);
        }}
      />
    </div>
  );
}
