"use client";

import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from "recharts";

interface Props { pct: number; done: number; total: number }

export default function OverallGauge({ pct, done, total }: Props) {
  const data = [{ value: pct, fill: pct === 100 ? "#22c55e" : "#3b82f6" }];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-52 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="75%" outerRadius="100%"
            startAngle={220} endAngle={-40}
            data={data}
            barSize={16}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#e2e8f0" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-slate-800">{pct}%</span>
          <span className="text-xs text-slate-500 mt-1">{done}/{total} tasks</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-600 mt-2">Overall Completion</p>
    </div>
  );
}
