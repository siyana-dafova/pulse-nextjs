import { dailyGoals } from "@/lib/fitness-data";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function DailyGoals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Goals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {dailyGoals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.current / goal.target) * 100),
          );
          return (
            <div key={goal.label}>
              <div className="flex justify-between text-sm">
                <span>{goal.label}</span>
                <span className="text-muted-foreground">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
