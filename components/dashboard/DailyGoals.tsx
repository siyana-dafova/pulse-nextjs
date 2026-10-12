import { ProgressBar } from "@/components/fitness/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DailyGoals({
  goals,
}: {
  goals: Array<{ id: string; label: string; current: number; target: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s goals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No goals yet.</p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id}>
              <div className="flex justify-between text-sm">
                <span>{goal.label}</span>
                <span className="text-muted-foreground">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <ProgressBar current={goal.current} target={goal.target} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
