import { ActivityChart } from "@/components/dashboard/ActivityChart";
import StatCard from "@/components/dashboard/StatCard";
import { metrics, Trend } from "@/lib/fitness-data";
import DailyGoals from "@/components/dashboard/DailyGoals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentWorkouts from "@/components/dashboard/RecentWorkouts";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend as Trend}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This week</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart />
          </CardContent>
        </Card>
        <DailyGoals />
      </div>

      <RecentWorkouts />
    </div>
  );
}
