import StatCard from "@/components/dashboard/StatCard";
import { metrics, Trend } from "@/lib/fitness-data";

export default function DashboardPage() {
  return (
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
  );
}
