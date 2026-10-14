"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/fitness/modal";
import { Button } from "@/components/ui/button";
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
  goalKindLabels,
  type Goal,
  type GoalInput,
  type GoalKind,
} from "@/lib/fitness-data";
import { GoalKindTakenError } from "@/lib/fitness-store";

const kinds: GoalKind[] = ["manual", "workouts", "minutes"];

const kindItems = Object.fromEntries(
  kinds.map((kind) => [kind, goalKindLabels[kind]]),
) as Record<GoalKind, string>;

type Draft = {
  label: string;
  target: string;
  current: string;
  kind: GoalKind;
};

function draftFromGoal(goal: Goal | null): Draft {
  if (!goal) {
    return { label: "", target: "", current: "0", kind: "manual" };
  }
  return {
    label: goal.label,
    target: String(goal.target),
    current: String(goal.current),
    kind: goal.kind,
  };
}

export function GoalDialog({
  goal,
  onOpenChange,
}: {
  goal: Goal | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { goals, addGoal, updateGoal } = useFitness();
  const [draft, setDraft] = useState<Draft>(() => draftFromGoal(goal));
  const [error, setError] = useState("");

  function kindDisabled(kind: GoalKind) {
    if (kind === "manual") return false;
    return goals.some((item) => item.kind === kind && item.id !== goal?.id);
  }

  async function save() {
    const label = draft.label.trim();
    const target = Number(draft.target);
    const current = Number(draft.current);

    if (!label) {
      setError("Enter a label.");
      return;
    }
    if (!Number.isFinite(target) || target <= 0) {
      setError("Enter a target greater than 0.");
      return;
    }
    if (draft.kind === "manual" && (!Number.isFinite(current) || current < 0)) {
      setError("Enter a current value of 0 or more.");
      return;
    }
    if (kindDisabled(draft.kind)) {
      setError(
        `A ${goalKindLabels[draft.kind].toLowerCase()} goal already exists.`,
      );
      return;
    }

    const input: GoalInput = {
      label,
      target,
      current: draft.kind === "manual" ? current : 0,
      kind: draft.kind,
    };
    // The check above uses this tab's list. The store has the final say.
    try {
      if (goal) await updateGoal(goal.id, input);
      else await addGoal(input);
    } catch (caught) {
      if (!(caught instanceof GoalKindTakenError)) throw caught;
      setError(
        `A ${goalKindLabels[draft.kind].toLowerCase()} goal already exists.`,
      );
      return;
    }
    onOpenChange(false);
  }

  return (
    <Modal
      title={goal ? "Edit goal" : "Add goal"}
      description="Workout and minute goals are counted from today's sessions."
      onClose={() => onOpenChange(false)}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-label">Label</Label>
          <Input
            id="goal-label"
            value={draft.label}
            onChange={(event) =>
              setDraft((current) => ({ ...current, label: event.target.value }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-target">Target</Label>
          <Input
            id="goal-target"
            type="number"
            min={1}
            step="any"
            value={draft.target}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                target: event.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Kind</Label>
          <Select
            items={kindItems}
            value={draft.kind}
            // false: the list sits inside our Modal, not a Base UI Dialog.
            modal={false}
            onValueChange={(value) => {
              if (
                value !== "manual" &&
                value !== "workouts" &&
                value !== "minutes"
              ) {
                return;
              }
              setDraft((current) => ({ ...current, kind: value }));
              setError("");
            }}
          >
            <SelectTrigger className="w-full" aria-label="Kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kinds.map((kind) => (
                <SelectItem
                  key={kind}
                  value={kind}
                  disabled={kindDisabled(kind)}
                >
                  {goalKindLabels[kind]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {draft.kind === "manual" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-current">Current</Label>
            <Input
              id="goal-current"
              type="number"
              min={0}
              step="any"
              value={draft.current}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  current: event.target.value,
                }))
              }
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Current progress is counted from today&apos;s done workouts.
          </p>
        )}

        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={save}>
            Save
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
