"use client";

import { Bar, BarChart as ReBarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART_SERIES, GRID_STROKE } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";

interface BarChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  barKey: string;
  name?: string;
  height?: number;
  /** Color each bar from a per-row color field. */
  colorKey?: string;
  valueFormatter?: (value: number, name: string) => string;
}

export function BarChart({
  data,
  xKey,
  barKey,
  name = "Value",
  height = 280,
  colorKey,
  valueFormatter,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS_PROPS} dy={8} />
        <YAxis {...AXIS_PROPS} width={48} />
        <Tooltip
          content={<ChartTooltip formatter={valueFormatter} />}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey={barKey} name={name} radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((row, i) => (
            <Cell
              key={i}
              fill={(colorKey && (row[colorKey] as string)) || CHART_SERIES[i % CHART_SERIES.length]}
            />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
