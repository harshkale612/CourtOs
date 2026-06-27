"use client";

import { Area, AreaChart as ReAreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART_COLORS, GRID_STROKE } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";

interface AreaChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
  height?: number;
  valueFormatter?: (value: number, name: string) => string;
}

export function AreaChart({ data, xKey, series, height = 280, valueFormatter }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          {series.map((s) => {
            const color = s.color ?? CHART_COLORS.blue;
            return (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS_PROPS} dy={8} />
        <YAxis {...AXIS_PROPS} width={48} />
        <Tooltip
          content={<ChartTooltip formatter={valueFormatter} />}
          cursor={{ stroke: "rgba(255,255,255,0.12)" }}
        />
        {series.map((s) => {
          const color = s.color ?? CHART_COLORS.blue;
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          );
        })}
      </ReAreaChart>
    </ResponsiveContainer>
  );
}
