"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFitness } from "@/components/fitness/fitness-context";
import {
  todayISO,
  workoutStatuses,
  workoutStatusLabels,
  workoutTypes,
  workoutTypeLabels,
  type Units,
  type Workout,
  type WorkoutInput,
  type WorkoutStatus,
  type WorkoutType,
} from "@/lib/fitness-data";

/** Minutes and distance stay strings so the field can be empty while typing. */
type Draft = {
  name: string;
  type: WorkoutType;
  date: string;
  minutes: string;
  distance: string;
  status: WorkoutStatus;
};

type Errors = Partial<Record<"name" | "date" | "minutes" | "distance", string>>;

function emptyDraft(date: string): Draft {
  return {
    name: "",
    type: "strength",
    date,
    minutes: "",
    distance: "",
    status: "done",
  };
}

function draftFromWorkout(workout: Workout): Draft {
  return {
    name: workout.name,
    type: workout.type,
    date: workout.date,
    minutes: String(workout.minutes),
    distance: workout.distance == null ? "" : String(workout.distance),
    status: workout.status,
  };
}

const typeItems = Object.fromEntries(
  workoutTypes.map((type) => [type, workoutTypeLabels[type]]),
) as Record<WorkoutType, string>;

const statusItems = Object.fromEntries(
  workoutStatuses.map((status) => [status, workoutStatusLabels[status]]),
) as Record<WorkoutStatus, string>;

/** Stays mounted so the dialog can animate out and return focus to the button that opened it. */
export function WorkoutDialog({
  open,
  workout,
  units,
  onOpenChange,
}: {
  open: boolean;
  workout: Workout | null;
  units: Units;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{workout ? "Edit workout" : "Add workout"}</DialogTitle>
          <DialogDescription>
            {workout ? "Update this session." : "Add a session to your log."}
          </DialogDescription>
        </DialogHeader>
        {/* The popup unmounts on close, so the draft starts fresh on every open. The key covers a switch between records. */}
        <WorkoutForm
          key={workout?.id ?? "new"}
          workout={workout}
          units={units}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function WorkoutForm({
  workout,
  units,
  onDone,
}: {
  workout: Workout | null;
  units: Units;
  onDone: () => void;
}) {
  const { addWorkout, updateWorkout } = useFitness();
  const [draft, setDraft] = useState<Draft>(() =>
    workout ? draftFromWorkout(workout) : emptyDraft(todayISO()),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    const nextErrors: Errors = {};
    const name = draft.name.trim();
    const minutes = Number(draft.minutes);
    const distance =
      draft.distance.trim() === "" ? undefined : Number(draft.distance);

    if (!name) nextErrors.name = "Enter a name.";
    if (!draft.date) nextErrors.date = "Choose a date.";
    if (!Number.isInteger(minutes) || minutes <= 0) {
      nextErrors.minutes = "Enter whole minutes greater than 0.";
    }
    if (
      draft.type === "cardio" &&
      distance !== undefined &&
      (!Number.isFinite(distance) || distance <= 0)
    ) {
      nextErrors.distance = "Enter a distance greater than 0.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: WorkoutInput = {
      name,
      type: draft.type,
      date: draft.date,
      minutes,
      status: draft.status,
      distance: draft.type === "cardio" ? distance : undefined,
    };

    setSaving(true);
    try {
      if (workout) await updateWorkout(workout.id, input);
      else await addWorkout(input);
      onDone();
    } catch {
      // The provider shows a failed write. Keep the form open.
    } finally {
      setSaving(false);
    }
  }

  const id = useId();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Field id={`${id}-name`} label="Name" error={errors.name}>
        <Input
          id={`${id}-name`}
          value={draft.name}
          onChange={(event) =>
            setDraft((current) => ({ ...current, name: event.target.value }))
          }
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      <Field id={`${id}-type`} label="Type">
        <Select
          items={typeItems}
          value={draft.type}
          onValueChange={(value) => {
            if (
              value !== "strength" &&
              value !== "cardio" &&
              value !== "mobility"
            ) {
              return;
            }
            setDraft((current) => ({
              ...current,
              type: value,
              distance: value === "cardio" ? current.distance : "",
            }));
          }}
        >
          <SelectTrigger id={`${id}-type`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {workoutTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {workoutTypeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id={`${id}-date`} label="Date" error={errors.date}>
        <Input
          id={`${id}-date`}
          type="date"
          value={draft.date}
          onChange={(event) =>
            setDraft((current) => ({ ...current, date: event.target.value }))
          }
          aria-invalid={Boolean(errors.date)}
        />
      </Field>

      <Field id={`${id}-minutes`} label="Minutes" error={errors.minutes}>
        <Input
          id={`${id}-minutes`}
          type="number"
          min={1}
          step={1}
          value={draft.minutes}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              minutes: event.target.value,
            }))
          }
          aria-invalid={Boolean(errors.minutes)}
        />
      </Field>

      {draft.type === "cardio" ? (
        <Field
          id={`${id}-distance`}
          label={`Distance (${units})`}
          error={errors.distance}
        >
          <Input
            id={`${id}-distance`}
            type="number"
            min={0}
            step="0.1"
            value={draft.distance}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                distance: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.distance)}
          />
        </Field>
      ) : null}

      <Field id={`${id}-status`} label="Status">
        <Select
          items={statusItems}
          value={draft.status}
          onValueChange={(value) => {
            if (
              value !== "done" &&
              value !== "planned" &&
              value !== "skipped"
            ) {
              return;
            }
            setDraft((current) => ({ ...current, status: value }));
          }}
        >
          <SelectTrigger id={`${id}-status`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {workoutStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {workoutStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={saving}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

/** `id` must match the control inside, so the label names it and a click on the label focuses it. */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
