"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StageDropoff } from "@/lib/analyzePipeline";

type Props = {
  data: StageDropoff[];
};

const STAGE_COLORS: Record<string, string> = {
  "New Lead": "#F0C4B0",
  Contacted: "#E0A080",
  Qualified: "#D08060",
  "Meeting Scheduled": "#C96442",
  Lost: "#ef4444",
};

export function StageDropoffChart({ data }: Props) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          barCategoryGap="30%"
        >
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 11, fill: "#A8A29E" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#A8A29E" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            formatter={(value: number) => [`${value} leads`, "Count"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.stage}
                fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
