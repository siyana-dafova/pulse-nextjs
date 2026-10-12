"use client";

import { ChartFrame } from "@/components/fitness/chart-frame";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ActivityChart({
  data,
}: {
  data: Array<{ day: string; minutes: number }>;
}) {
  return (
    <ChartFrame>
      {({ width, height }) => (
        <LineChart width={width} height={height} data={data}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="minutes"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      )}
    </ChartFrame>
  );
}
