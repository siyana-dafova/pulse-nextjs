"use client";

import { ChartFrame } from "@/components/fitness/chart-frame";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

export function MinutesBarChart({
  data,
}: {
  data: Array<{ label: string; minutes: number }>;
}) {
  return (
    <ChartFrame>
      {({ width, height }) => (
        <BarChart width={width} height={height} data={data}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ChartFrame>
  );
}
