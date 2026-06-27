"use client";

import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_SERIES } from "./chart-theme";
import { ChartTooltip } from "./chart-tooltip";

interface DonutDatum {
  name: string;
  value: number;
  color?: string;
}

export function DonutChart({
  data,
  height = 240,
  centerLabel,
  centerValue,
  valueFormatter,
}: {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  valueFormatter?: (value: number, name: string) => string;
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="64%"
            outerRadius="92%"
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color ?? CHART_SERIES[i % CHART_SERIES.length]} />
            ))}
          </Pie>
        </RePieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="tnum text-2xl font-bold tracking-tight">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-ink-tertiary">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
