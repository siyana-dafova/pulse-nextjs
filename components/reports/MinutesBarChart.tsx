"use client";

import {
  ChartFrame,
  chartAxisTick,
  chartTooltipProps,
} from "@/components/fitness/chart-frame";
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
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={chartAxisTick}
          />
          <YAxis tickLine={false} axisLine={false} tick={chartAxisTick} />
          <Tooltip {...chartTooltipProps} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ChartFrame>
  );
}
