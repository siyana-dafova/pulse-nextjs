import { Badge } from "@/components/ui/badge";
import { workoutStatusLabels, type WorkoutStatus } from "@/lib/fitness-data";

export function statusBadgeClass(status: WorkoutStatus) {
  switch (status) {
    case "done":
      return "bg-success/10 text-success";
    case "planned":
      return "bg-primary/10 text-primary";
    case "skipped":
      return "bg-destructive/10 text-destructive";
  }
}

export function StatusBadge({ status }: { status: WorkoutStatus }) {
  return (
    <Badge className={statusBadgeClass(status)}>
      {workoutStatusLabels[status]}
    </Badge>
  );
}
