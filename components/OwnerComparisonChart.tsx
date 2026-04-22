"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { SegmentBreakdown } from "@/lib/analyzePipeline";

type Props = {
  data: SegmentBreakdown[];
  baseline: number;
};

export function OwnerComparisonChart({ data, baseline }: Props) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          barCategoryGap="35%"
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#A8A29E" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#A8A29E" }}
            axisLine={false}
            tickLine={false}
            width={32}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <ReferenceLine
            y={baseline}
            stroke="#A8A29E"
            strokeDasharray="4 3"
            label={{
              value: `avg ${baseline}%`,
              position: "insideTopRight",
              fontSize: 10,
              fill: "#A8A29E",
            }}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            formatter={(value: number) => [`${value}%`, "Conversion rate"]}
          />
          <Bar dataKey="conversionRate" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.label}
                fill={
                  entry.conversionRate >= baseline ? "#C96442" : "#ef4444"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
