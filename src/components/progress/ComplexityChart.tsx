"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, LabelList,
} from "recharts";

const COLORS: Record<string, string> = {
  highest: "#ef4444",
  high:    "#f97316",
  medium:  "#eab308",
  low:     "#22c55e",
};

interface Props { data: { name: string; value: number }[] }

export default function ComplexityChart({ data }: Props) {
  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="name"
            tick={{ fontSize: 12, fill: "#64748b" }}
            width={60} axisLine={false} tickLine={false}
          />
          <Tooltip formatter={(v) => [`${v} tasks`, "Count"]} />
          <Bar dataKey="value" radius={4} barSize={18}>
            <LabelList dataKey="value" position="right" style={{ fontSize: 12, fill: "#475569" }} />
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.name] ?? "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
